const pool = require("../config/database");
const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,

      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100),

      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,

      phone VARCHAR(20),
      profile_image TEXT,
      profile_image_key TEXT,

      role VARCHAR(20) DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),

      status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'suspended')),

      email_verified BOOLEAN DEFAULT FALSE,

      email_verification_token TEXT,

      subscription_type VARCHAR(10) DEFAULT 'basic',
      subscription_expiry TIMESTAMP NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};

module.exports = { createUserTable };
