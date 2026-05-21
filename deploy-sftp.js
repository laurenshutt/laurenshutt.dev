import dotenv from "dotenv";
dotenv.config();

import Client from "ssh2-sftp-client";
import fs from "fs";

const sftp = new Client();

async function deploy() {
    await sftp.connect({
        host: process.env.SFTP_HOST,
        port: Number(process.env.SFTP_PORT),
        username: process.env.SFTP_USER,
        privateKey: fs.readFileSync(process.env.SSH_KEY_PATH),
    });

  console.log("📦 Uploading dist...");

  await sftp.uploadDir("./dist", "/home/laurenshutt.dev/www");

  await sftp.end();

  console.log("✅ Deploy complete");
}

deploy().catch(err => {
  console.error("❌ Deploy failed:", err);
});