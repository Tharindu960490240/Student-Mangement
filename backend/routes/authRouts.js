const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/auth");
// const { uploadProfile } = require("../middlewares/upload");

const {
  register,
  login,
  verifyUser,
  getProfile,
  updateUserProfile,
  updateUserImage,
  changeUserPassword,
  resendVerification,
  getUsers,
  updateUserStatus,
  sendPasswordResetLink,
  resetPasswordFromLink,
  deleteUserAccount,
} = require("../controllers/authController");

// Public
router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyUser);
router.post("/resend", resendVerification);
router.post("/forgot-password", sendPasswordResetLink);
router.post("/reset-password", resetPasswordFromLink);

// User
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateUserProfile);
// router.put(
//   "/me/image",
//   authMiddleware,
//   uploadProfile.single("image"),
//   updateUserImage,
// );
router.put("/me/password", authMiddleware, changeUserPassword);
router.delete("/me", authMiddleware, deleteUserAccount);

// Admin
router.get("/", authMiddleware, getUsers);
router.patch("/:id/status", authMiddleware, updateUserStatus);

module.exports = router;
