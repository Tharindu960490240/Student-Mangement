const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  requireTLS: true,
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("FULL ERROR:", error);
  } else {
    console.log("Email service is ready");
  }
});

// Send email
const sendEmail = async ({ email, subject, html }) => {
  try {
    const mailOptions = {
      from: `" AFC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error(error.message);
  }
};

module.exports = {
  sendEmail,
};


