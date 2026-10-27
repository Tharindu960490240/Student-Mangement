const asyncHandler = require("../utils/asyncHandler");
const { clientInfo } = require("../utils/request");
const authService = require("../services/authService");
const userService = require("../services/userService");

const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body.email, req.body.password, clientInfo(req));
  res.json({ success: true, data: { token, user } });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email, clientInfo(req));
  res.json({ success: true, message: "If an account exists for that email, a reset link has been sent." });
});

const validateResetToken = asyncHandler(async (req, res) => {
  const data = await authService.checkResetToken(req.body.token);
  res.json({ success: true, data });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password, clientInfo(req));
  res.json({ success: true, message: "Your password has been updated. You can now sign in." });
});

const me = (req, res) => res.json({ success: true, user: authService.toPublicUser(req.user) });

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateOwnProfile(req.user, req.body);
  res.json({ success: true, user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { token } = await authService.changePassword(req.user, req.body.currentPassword, req.body.newPassword, clientInfo(req));
  res.json({ success: true, message: "Password updated.", data: { token } });
});

module.exports = { login, forgotPassword, validateResetToken, resetPassword, me, updateMe, changePassword };
