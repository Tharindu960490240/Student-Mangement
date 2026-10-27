const router = require("express").Router();
router.get("/health", (req, res) => res.json({ success: true, status: "ok" }));
router.use("/auth", require("./authRoutes"));
router.use("/invitations", require("./invitationRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/agents", require("./agentRoutes"));
router.use("/agreement-template", require("./templateRoutes"));
router.use("/agreements", require("./agreementRoutes"));
module.exports = router;
