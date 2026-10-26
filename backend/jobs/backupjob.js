require("dotenv").config();
const { spawn } = require("child_process");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");

/* ===============================
   S3 CONFIG
=============================== */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* ===============================
   MAIN BACKUP FUNCTION
=============================== */
const backupDatabase = () => {
  const DB_NAME = process.env.DB_NAME;
  const DB_USER = process.env.DB_USER;
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_PASSWORD = process.env.DB_PASSWORD;

  // STRATEGY: Verify the path exists before attempting to spawn
  const possiblePaths = ["/usr/bin/pg_dump", "/usr/local/bin/pg_dump", "/usr/lib/postgresql/18/bin/pg_dump"];
  const PG_DUMP_PATH = possiblePaths.find(path => fs.existsSync(path));

  if (!PG_DUMP_PATH) {
    throw new Error("CRITICAL: Could not find pg_dump binary on the system. Please run 'which pg_dump' in your terminal.");
  }

  console.log(`Using pg_dump at: ${PG_DUMP_PATH}`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${timestamp}.sql`;

  return new Promise((resolve, reject) => {
    const pgDump = spawn(
      PG_DUMP_PATH,
      ["-U", DB_USER, "-h", DB_HOST, DB_NAME],
      {
        env: { ...process.env, PGPASSWORD: DB_PASSWORD },
      }
    );

    let errorOutput = "";
    pgDump.stderr.on("data", (data) => { errorOutput += data.toString(); });
    pgDump.on("error", (err) => { reject(err); });

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `db-backups/${fileName}`,
        Body: pgDump.stdout,
        ContentType: "application/sql",
      },
    });

    upload.done()
      .then(() => { resolve(true); })
      .catch((err) => { reject(err); });

    pgDump.on("close", (code) => {
      if (code !== 0) reject(new Error(`pg_dump failed (${code}): ${errorOutput}`));
    });
  });
};

module.exports = backupDatabase;