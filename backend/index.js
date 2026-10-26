require("dotenv").config();

const express = require("express");
const cors = require("cors");

const cron = require("node-cron");
const backupDatabase = require("./jobs/backupjob.js");

// ================= ROUTES =================
const authRoutes = require("./routes/authRouts.js");

// ================= DB =================
const { createDatabase } = require("./config/database.js");
const { createUserTable } = require("./models/auth.js");

const app = express();
const PORT = process.env.PORT || 3200;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ================= STATIC FILES =================
// for uploaded images
app.use("/uploads", express.static("uploads"));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("AFC API is running...");
});

// ================= ROUTES =================
app.use("/api/auth", authRoutes);

// ================= SERVER START =================
const startServer = async () => {
  try {
    // DB setup
    await createDatabase();

    // Core tables
    await createUserTable();

    console.log("Database & tables ready");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });

    // ================= GRACEFUL SHUTDOWN =================
    process.on("SIGINT", () => {
      console.log("Shutting down server...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGTERM", () => {
      console.log("Process terminated");
      server.close(() => {
        console.log("Server closed");
      });
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
};

startServer();

cron.schedule(
  "0 0 * * *",
  () => {
    console.log("Running subscription cleanup...");
    downgradeExpiredUsers();
  },
  {
    timezone: "Asia/Colombo",
  },
);

cron.schedule(
  "0 0 * * *",
  () => {
    console.log("Running DB backup...");
    backupDatabase();
  },
  {
    timezone: "Australia/Melbourne",
  },
);
