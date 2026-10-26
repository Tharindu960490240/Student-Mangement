const {
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
  deleteUser,
} = require("../services/authService");

const {
  generateToken,
  generateResetToken,
  verifyToken,
} = require("../utils/jwt");

const { buildEmailTemplate } = require("../utils/emailTemplate");

const { sendEmail } = require("../services/emailService");

require("dotenv").config();

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const isFirstNameValid =
      /^[\p{L}]+(?:\s[\p{L}]+)*$/u.test(req.body.first_name) &&
      req.body.first_name.length > 0;

    const isLastNameValid =
      /^[\p{L}]+(?:\s[\p{L}]+)*$/u.test(req.body.last_name) &&
      req.body.last_name.length > 0;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email);

    const isContactNoValid = /^\d{10}$/.test(req.body.phone);

    const isPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        req.body.password,
      );

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isEmailValid ||
      !isContactNoValid ||
      !isPasswordValid
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const { user, verificationToken } = await registerUser(req.body);

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    const html = buildEmailTemplate({
      title: "Verify your account | ගිණුම තහවුරු කරන්න",
      content: `
      <h3 style="margin-top:0;">Hi ${req.body.first_name || "there"} / ආයුබෝවන්,</h3>
      
      <!-- English Section -->
      <div style="font-size:15px; line-height:1.6; color:#555; margin-bottom: 20px;">
        <p>Thank you for joining <strong> AFC</strong> - Sri Lanka’s trusted animal AFC. We are excited to have you onboard!</p>
        <p>To complete your registration, please verify your email address by clicking the button below.</p>
      </div>
      
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
      
      <!-- Sinhala Section -->
      <div style="font-size:15px; line-height:1.6; color:#555;">
        <p>ශ්‍රී ලංකාවේ විශ්වාසදායී සත්ව සහ කෘෂිකාර්මික වෙළඳපොළ වන <strong> AFC</strong> සමඟ සම්බන්ධ වීම පිළිබඳව ඔබට ස්තුතියි!</p>
        <p>ඔබේ ලියාපදිංචිය සම්පූර්ණ කිරීම සඳහා, කරුණාකර පහත බොත්තම ක්ලික් කර ඔබගේ විද්‍යුත් තැපැල් ලිපිනය (Email) තහවුරු කරන්න.</p>
      </div>
      <br>
      `,
      action: {
        text: "Verify Account / ගිණුම තහවුරු කරන්න",
        url: verifyUrl,
      },
    });

    await sendEmail({
      email: req.body.email,
      subject:
        "Verify your account -  AFC | ගිණුම තහවුරු කරන්න",
      html: html,
    });

    res.status(201).json({
      message: "User registered. Verify email.",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);

    const token = generateToken(user);

    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// ================= VERIFY =================
const verifyUserController = async (req, res) => {
  try {
    const result = await verifyUser(req.params.token);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= GET PROFILE =================
const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE PROFILE =================
const updateUserProfile = async (req, res) => {
  try {
    const user = await updateProfile(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE PROFILE IMAGE =================
const updateUserImage = async (req, res) => {
  try {
    const user = await updateProfileImage(req.user.id, req.file);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CHANGE PASSWORD =================
const changeUserPassword = async (req, res) => {
  try {
    const result = await changePassword(
      req.user.id,
      req.body.oldPassword,
      req.body.newPassword,
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= RESEND VERIFICATION =================
const resendVerificationController = async (req, res) => {
  try {
    const { user, token } = await resendVerification(req.body.email);

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;

    const html = buildEmailTemplate({
      title: "Verify your account | ගිණුම තහවුරු කරන්න",
      content: `
      <h3 style="margin-top:0;">Hi ${user.first_name || "there"} / ආයුබෝවන්,</h3>
      
      <!-- English Section -->
      <div style="font-size:15px; line-height:1.6; color:#555; margin-bottom: 20px;">
        <p>Thank you for joining <strong> AFC</strong> - Sri Lanka’s trusted animal AFC. We are excited to have you onboard!</p>
        <p>To complete your registration, please verify your email address by clicking the button below.</p>
      </div>
      
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
      
      <!-- Sinhala Section -->
      <div style="font-size:15px; line-height:1.6; color:#555;">
        <p>ශ්‍රී ලංකාවේ විශ්වාසදායී සත්ව සහ කෘෂිකාර්මික වෙළඳපොළ වන <strong> AFC</strong> සමඟ සම්බන්ධ වීම පිළිබඳව ඔබට ස්තුතියි!</p>
        <p>ඔබේ ලියාපදිංචිය සම්පූර්ණ කිරීම සඳහා, කරුණාකර පහත බොත්තම ක්ලික් කර ඔබගේ විද්‍යුත් තැපැල් ලිපිනය (Email) තහවුරු කරන්න.</p>
      </div>
      <br>
      `,
      action: {
        text: "Verify Account / ගිණුම තහවුරු කරන්න",
        url: verifyUrl,
      },
    });

    await sendEmail({
      email: user.email,
      subject:
        "Verify your account -  AFC | ගිණුම තහවුරු කරන්න",
      html: html,
    });

    res.json({ message: "Verification email sent again" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= ADMIN: GET USERS =================
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, role } = req.query;

    const result = await getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
      role,
    });

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ================= ADMIN: UPDATE STATUS =================
const updateUserStatusController = async (req, res) => {
  try {
    const user = await updateUserStatus(req.params.id, req.body.status);

    const saved_user = await getUserByEmail(req.body.email);

    if (req.body.status == "suspended" || req.body.status == "active") {
      const isSuspended = req.body.status === "suspended";

      const html = buildEmailTemplate({
        title: isSuspended
          ? "Account Suspended | ගිණුම අත්හිටුවා ඇත"
          : "Account Activated | ගිණුම සක්‍රීය කර ඇත",
        content: isSuspended
          ? `
          <h3 style="margin-top:0;">Hi ${saved_user.first_name || "there"} / ආයුබෝවන්,</h3>

          <!-- English Section -->
          <div style="font-size:15px;line-height:1.6;color:#555;">
            <p>Your  AFC account has been <strong>suspended</strong> due to a violation of our platform policies.</p>
            <p>If you believe this was a mistake or need further clarification, please contact our support team.</p>
            <p>Email: support@sathwasewana.com</p>
            <p style="margin-top:15px;color:#999;">Thank you for your understanding.</p>
          </div>

          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

          <!-- Sinhala Section -->
          <div style="font-size:15px;line-height:1.6;color:#555;">
            <p>අපගේ වේදිකාවේ නීති සහ මාර්ගෝපදේශ උල්ලංඝනය කිරීම හේතුවෙන් ඔබේ  AFC ගිණුම මේ වන විට <strong>අත්හිටුවා (suspended)</strong> ඇත.</p>
            <p>මෙය වැරදීමකින් සිදුවූවක් යැයි ඔබ සිතන්නේ නම් හෝ මේ පිළිබඳව වැඩිදුර තොරතුරු අවශ්‍ය නම්, කරුණාකර අපගේ සහාය කණ්ඩායම සම්බන්ධ කර ගන්න.</p>
            <p>විද්‍යුත් තැපෑල: support@sathwasewana.com</p>
            <p style="margin-top:15px;color:#999;">ඔබගේ සහයෝගීතාවයට ස්තුතියි.</p>
          </div>
        `
          : `
          <h3 style="margin-top:0;">Hi ${saved_user.first_name || "there"} / ආයුබෝවන්,</h3>

          <!-- English Section -->
          <div style="font-size:15px;line-height:1.6;color:#555;">
            <p>Great news! Your  AFC account is now <strong>active</strong>.</p>
            <p>You can now access all features of the platform and continue using our services without any restrictions.</p>
            <p>If you have any questions or need assistance, feel free to contact our support team anytime.</p>
            <p>Email: support@sathwasewana.com</p>
            <p style="margin-top:15px;color:#999;">Thank you for being part of  AFC.</p>
          </div>

          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

          <!-- Sinhala Section -->
          <div style="font-size:15px;line-height:1.6;color:#555;">
            <p>සුභ ආරංචියක්! ඔබේ  AFC ගිණුම දැන් නැවතත් <strong>සක්‍රීය (active)</strong> කර ඇත.</p>
            <p>ඔබට දැන් කිසිදු බාධාවකින් තොරව වේදිකාවේ සියලුම පහසුකම් භාවිතා කිරීමට සහ අපගේ සේවාවන් ලබා ගැනීමට හැකිය.</p>
            <p>ඔබට කිසියම් ප්‍රශ්නයක් ඇත්නම් හෝ සහාය අවශ්‍ය නම්, ඕනෑම වේලාවක අපගේ සහාය කණ්ඩායම සම්බන්ධ කර ගන්න.</p>
            <p>විද්‍යුත් තැපෑල: support@sathwasewana.com</p>
            <p style="margin-top:15px;color:#999;"> AFC සමඟ රැඳී සිටීම පිළිබඳව ස්තුතියි.</p>
          </div>
        `,
      });

      await sendEmail({
        email: saved_user.email,
        subject: isSuspended
          ? "Account Suspended -  AFC | ගිණුම අත්හිටුවා ඇත"
          : "Account Activated -  AFC | ගිණුම සක්‍රීය කර ඇත",
        html: html,
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendPasswordResetLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const token = generateResetToken(user);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = buildEmailTemplate({
      title: "Password Reset Request | මුරපදය යළි පිහිටුවීම",
      content: `
      <h3 style="margin-top:0;">Hi ${user.first_name || "there"} / ආයුබෝවන්,</h3>
      
      <!-- English Section -->
      <div style="font-size:15px; line-height:1.6; color:#555; margin-bottom: 20px;">
        <p>We received a request to reset the password for your <strong> AFC</strong> account.</p>
        <p>Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.</p>
      </div>
      
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
      
      <!-- Sinhala Section -->
      <div style="font-size:15px; line-height:1.6; color:#555;">
        <p>ඔබගේ <strong> AFC</strong> ගිණුමේ මුරපදය (Password) යළි පිහිටුවීම සඳහා අපට ඉල්ලීමක් ලැබී ඇත.</p>
        <p>ඔබගේ මුරපදය වෙනස් කිරීමට පහත බොත්තම ක්ලික් කරන්න. මෙම සබැඳිය (Link) <strong>පැය 1කින්</strong> කල් ඉකුත් වනු ඇත.</p>
      </div>
      <br>
      `,
      action: {
        text: "Reset My Password / මුරපදය යළි පිහිටුවන්න",
        url: resetUrl,
      },
    });

    await sendEmail({
      email: user.email,
      subject:
        "Reset Your Password -  AFC | මුරපදය යළි පිහිටුවීම",
      html: html,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const resetPasswordFromLink = async (req, res) => {
  try {
    const { token, password } = req.body;

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(400).json({
        error: "Invalid or expired token",
      });
    }

    const result = await resetPasswordByToken(decoded.id, password);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= DELETE ACCOUNT =================
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await deleteUser(userId);

    // Send farewell email AFTER deletion
    const html = buildEmailTemplate({
      title: "Account Deleted | ගිණුම ඉවත් කර ඇත",
      content: `
        <h3 style="margin-top:0;">Goodbye ${deletedUser.first_name || "there"} / සුභ ගමන්,</h3>

        <!-- English Section -->
        <div style="font-size:15px;line-height:1.6;color:#555;">
          <p>Your <strong> AFC</strong> account has been permanently deleted as requested.</p>
          <p>We’re sorry to see you go. All your data has been removed from our system.</p>
          <p>If this was a mistake or you change your mind, you can always create a new account.</p>
          <p style="margin-top:15px;color:#999;">Thank you for being part of our platform.</p>
        </div>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

        <!-- Sinhala Section -->
        <div style="font-size:15px;line-height:1.6;color:#555;">
          <p>ඔබගේ ඉල්ලීම පරිදි ඔබේ <strong> AFC</strong> ගිණුම ස්ථිරවම ඉවත් කර (deleted) ඇත.</p>
          <p>ඔබ අපෙන් සමුගැනීම පිළිබඳව කණගාටු වන අතර, ඔබගේ සියලුම දත්ත අපගේ පද්ධතියෙන් ඉවත් කර ඇති බව දන්වා සිටිමු.</p>
          <p>මෙය වැරදීමකින් සිදුවූවක් නම් හෝ ඔබගේ අදහස වෙනස් වුවහොත්, ඔබට ඕනෑම වේලාවක නව ගිණුමක් ආරම්භ කළ හැකිය.</p>
          <p style="margin-top:15px;color:#999;">මෙතෙක් කල් අපගේ වේදිකාව සමඟ රැඳී සිටීම පිළිබඳව ඔබට ස්තුතියි.</p>
        </div>
      `,
    });

    await sendEmail({
      email: deletedUser.email,
      subject:
        "Your Account Has Been Deleted -  AFC | ගිණුම ඉවත් කර ඇත",
      html,
    });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  verifyUser: verifyUserController,
  getProfile,
  updateUserProfile,
  updateUserImage,
  changeUserPassword,
  resendVerification: resendVerificationController,
  getUsers,
  updateUserStatus: updateUserStatusController,
  sendPasswordResetLink,
  resetPasswordFromLink,
  deleteUserAccount,
};

// await pool.query(`
//   UPDATE users
//   SET subscription_type = 'premium',
//       subscription_expiry = NOW() + INTERVAL '30 days'
//   WHERE id = $1
// `, [userId]);
