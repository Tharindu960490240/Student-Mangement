const pool = require("../config/database");
const crypto = require("crypto");
const { hashPassword, comparePassword } = require("../utils/hash");

const {
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const { s3 } = require("../middlewares/upload");


// ================= REGISTER USER =================
const registerUser = async (data) => {
  const { first_name, last_name, email, password, phone, role } = data;

  // 1. Check existing user
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }

  // 2. Hash password
  const hashed = await hashPassword(password);

  // 3. Generate verification token
  const token = crypto.randomBytes(32).toString("hex");

  // 4. Insert user
  const result = await pool.query(
    `INSERT INTO users 
    (first_name, last_name, email, password_hash, phone, email_verification_token, status, email_verified, role)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending', false, $7)
    RETURNING id, email, status`,
    [first_name, last_name, email, hashed, phone, token, role || "user"],
  );

  return {
    user: result.rows[0],
    verificationToken: token,
  };
};

// ================= LOGIN USER =================
const loginUser = async (email, password) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  // check verification
  if (!user.email_verified || user.status !== "active") {
    throw new Error("Please verify your email first");
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
};

// ================= VERIFY USER =================
const verifyUser = async (token) => {
  // 1. Find user by token OR already verified user
  const result = await pool.query(
    "SELECT * FROM users WHERE email_verification_token = $1",
    [token],
  );

  const user = result.rows[0];

  //  Invalid token
  if (!user) {
    throw new Error("Invalid or expired verification token");
  }

  //  Already verified check (IMPORTANT)
  if (user.email_verified === true && user.status === "active") {
    return {
      message: "Account is already verified. You can login.",
    };
  }

  // 2. Activate account
  await pool.query(
    `UPDATE users 
     SET email_verified = true,
         status = 'active',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [user.id],
  );

  return {
    message: "Account verified successfully. You can now login.",
  };
};

// ================= GET USER BY ID =================
const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, phone, role, status, profile_image
     FROM users WHERE id = $1`,
    [userId],
  );

  return result.rows[0];
};

// ================= UPDATE PROFILE =================
const updateProfile = async (userId, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.first_name !== undefined) {
    fields.push(`first_name = $${index++}`);
    values.push(data.first_name);
  }

  if (data.last_name !== undefined) {
    fields.push(`last_name = $${index++}`);
    values.push(data.last_name);
  }

  if (data.phone !== undefined) {
    fields.push(`phone = $${index++}`);
    values.push(data.phone);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(userId);

  const query = `
    UPDATE users
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING id, first_name, last_name, email, phone, profile_image;
  `;

  const result = await pool.query(query, values);

  return result.rows[0];
};

// ================= UPDATE PROFILE IMAGE =================
const updateProfileImage = async (userId, file) => {
  try {

    // ===============================
    // GET OLD IMAGE
    // ===============================
    const userResult = await pool.query(
      `
      SELECT
        profile_image,
        profile_image_key
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const user = userResult.rows[0];

    // ===============================
    // DELETE OLD IMAGE FROM S3
    // ===============================
    if (user?.profile_image_key) {

      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: user.profile_image_key,
        })
      );
    }

    // ===============================
    // NEW IMAGE VALUES
    // ===============================
    const imageUrl = file.location;
    const imageKey = file.key;

    // ===============================
    // UPDATE DATABASE
    // ===============================
    const result = await pool.query(
      `
      UPDATE users
      SET
        profile_image = $1,
        profile_image_key = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING
        id,
        profile_image
      `,
      [
        imageUrl,
        imageKey,
        userId,
      ]
    );

    return result.rows[0];

  } catch (err) {
    throw new Error(err.message);
  }
};

// ================= CHANGE PASSWORD =================
const changePassword = async (userId, oldPassword, newPassword) => {
  const result = await pool.query(
    `SELECT password_hash FROM users WHERE id=$1`,
    [userId],
  );

  const user = result.rows[0];

  const isMatch = await comparePassword(oldPassword, user.password_hash);

  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }

  const hashed = await hashPassword(newPassword);

  await pool.query(
    `UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`,
    [hashed, userId],
  );

  return { message: "Password updated successfully" };
};


// ================= RESEND VERIFICATION =================
const resendVerification = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  const user = result.rows[0];

  if (!user) throw new Error("User not found");

  if (user.email_verified) {
    throw new Error("Email already verified");
  }

  const token = crypto.randomBytes(32).toString("hex");

  await pool.query(`UPDATE users SET email_verification_token=$1 WHERE id=$2`, [
    token,
    user.id,
  ]);

  return { user, token };
};


// ================= ADMIN: GET ALL USERS =================
const getAllUsers = async (query) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    role,
    sortField = "created_at",
    sortOrder = "desc",
  } = query;


  const offset = (page - 1) * limit;

  const values = [];
  let index = 1;

  let where = `WHERE 1=1`;

  // ================= STATUS FILTER =================
  if (status) {
    where += ` AND status = $${index++}`;
    values.push(status);
  }

    if (role) {
    where += ` AND role = $${index++}`;
    values.push(role);
  }

  // ================= SEARCH =================
  if (search) {
    where += ` AND (
      first_name ILIKE $${index} OR
      last_name ILIKE $${index} OR
      email ILIKE $${index} OR
      phone ILIKE $${index} 
    )`;
    values.push(`%${search}%`);
    index++;
  }

  // ================= TOTAL COUNT =================
  const countQuery = `
    SELECT COUNT(*) FROM users
    ${where}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // ================= DATA QUERY =================
  const dataQuery = `
    SELECT 
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      status,
      email_verified,
      profile_image,
      email_verification_token,
      created_at
    FROM users
    ${where}
    ORDER BY ${sortField} ${sortOrder.toUpperCase()}
    LIMIT $${index++}
    OFFSET $${index++}
  `;

  values.push(limit, offset);

  const result = await pool.query(dataQuery, values);
  return {
    data: result.rows,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

// ================= ADMIN: UPDATE USER STATUS =================
const updateUserStatus = async (userId, status) => {
  const result = await pool.query(
    `UPDATE users SET status=$1 WHERE id=$2 RETURNING id, status`,
    [status, userId],
  );
  

  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, email, first_name FROM users WHERE email=$1`,
    [email],
  );

  return result.rows[0];
};

const resetPasswordByToken = async (userId, password) => {
  // 1. Validate user exists
  const userResult = await pool.query(`SELECT id FROM users WHERE id=$1`, [
    userId,
  ]);

  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  // 2. Hash password
  const hashed = await hashPassword(password);

  // 3. Update password
  const result = await pool.query(
    `UPDATE users 
     SET password_hash=$1,
         updated_at=NOW()
     WHERE id=$2
     RETURNING id, email`,
    [hashed, userId],
  );

  return { message: "Password updated successfully" };
};

const deleteUser = async (userId) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id=$1 RETURNING id, email, first_name`,
    [userId]
  );

  return result.rows[0];
};


module.exports = {
  registerUser,
  loginUser,
  verifyUser,
  getUserById,
  updateProfile,
  updateProfileImage,
  changePassword,
  resendVerification,
  getAllUsers,
  updateUserStatus,
  getUserByEmail,
  resetPasswordByToken,
  deleteUser
};
