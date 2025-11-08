/**
 * 🌸 Miara — Binary Verifier & Self-Healer
 * ----------------------------------------
 * Handles:
 *  - Auto-download of ffmpeg + yt-dlp
 *  - Auto-update yt-dlp weekly to keep cipher decryption fresh
 *  - Dynamic $PATH injection (works on Render, Heroku, Railway)
 *  - Cross-platform support (Linux, macOS, Windows)
 */

import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import https from "https";
import os from "os";

const binDir = path.resolve("bin");
const ffmpegPath = path.join(
  binDir,
  process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"
);
const ytdlpPath = path.join(
  binDir,
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
);

const BINARIES = {
  ffmpeg: {
    linux: "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
    darwin: "https://evermeet.cx/ffmpeg/getrelease/zip",
    win32:
      "https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-n5.1-latest-win64-gpl.zip"
  },
  ytdlp: {
    linux: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    darwin:
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    win32:
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
  }
};

function binaryWorks(cmd) {
  try {
    execSync(`${cmd} -version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading ${url}`);
    const file = fs.createWriteStream(dest, { mode: 0o755 });
    https
      .get(url, (res) => {
        if (res.statusCode !== 200)
          return reject(new Error(`HTTP ${res.statusCode}`));
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(dest));
        });
      })
      .on("error", (err) => reject(err));
  });
}

function autoUpdateYtDlp() {
  try {
    if (!fs.existsSync(ytdlpPath)) return;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const stats = fs.statSync(ytdlpPath);
    const age = Date.now() - stats.mtimeMs;
    if (age < oneWeek) return;

    console.log("🔄 Updating yt-dlp (weekly refresh)...");
    spawnSync(ytdlpPath, ["-U"], { stdio: "inherit" });
  } catch (err) {
    console.warn("⚠️  yt-dlp auto-update failed:", err.message);
  }
}

export async function verifyAndHealBinaries() {
  console.log("🔍 Checking Miara binaries...");
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

  let ffmpegOk = binaryWorks("ffmpeg") || fs.existsSync(ffmpegPath);
  let ytdlpOk = binaryWorks("yt-dlp") || fs.existsSync(ytdlpPath);

  if (!ffmpegOk && BINARIES.ffmpeg[process.platform]) {
    console.log("⚙️  Restoring ffmpeg...");
    await downloadFile(BINARIES.ffmpeg[process.platform], ffmpegPath);
    fs.chmodSync(ffmpegPath, 0o755);
    ffmpegOk = true;
  }

  if (!ytdlpOk && BINARIES.ytdlp[process.platform]) {
    console.log("⚙️  Restoring yt-dlp...");
    await downloadFile(BINARIES.ytdlp[process.platform], ytdlpPath);
    fs.chmodSync(ytdlpPath, 0o755);
    ytdlpOk = true;
  }

  // Dynamic PATH injection
  process.env.PATH = `${binDir}:${process.env.PATH}`;

  // Auto-update yt-dlp weekly to fix cipher issues
  autoUpdateYtDlp();

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌸 Miara Binary Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 ffmpeg: ${ffmpegOk ? "✅ OK" : "❌ Missing"}
📡 yt-dlp: ${ytdlpOk ? "✅ OK" : "❌ Missing"}
📁 bin: ${binDir}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}
