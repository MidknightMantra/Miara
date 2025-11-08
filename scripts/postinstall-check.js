import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import https from "https";
import os from "os";

const binDir = path.join(process.cwd(), "bin");
if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

const BINARIES = {
  ffmpeg: {
    linux: "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
    darwin: "https://evermeet.cx/ffmpeg/getrelease/zip",
    win32: "https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-n5.1-latest-win64-gpl.zip"
  },
  ytdlp: {
    linux: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    darwin: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    win32: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
  }
};

function binaryExists(cmd) {
  try {
    execSync(`${cmd} -version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading ${url}`);
    const file = fs.createWriteStream(dest, { mode: 0o755 });
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`Failed: ${res.statusCode}`));
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(dest));
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

(async () => {
  try {
    console.log("🌸 Running Miara postinstall check...");

    const ffmpegOk = binaryExists("ffmpeg");
    const ytdlpOk = binaryExists("yt-dlp");

    if (!ffmpegOk && BINARIES.ffmpeg[process.platform]) {
      const out = path.join(binDir, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
      await download(BINARIES.ffmpeg[process.platform], out);
      fs.chmodSync(out, 0o755);
      console.log("✅ ffmpeg ready.");
    }

    if (!ytdlpOk && BINARIES.ytdlp[process.platform]) {
      const out = path.join(binDir, process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
      await download(BINARIES.ytdlp[process.platform], out);
      fs.chmodSync(out, 0o755);
      console.log("✅ yt-dlp ready.");
    }

    process.env.PATH = `${binDir}:${process.env.PATH}`;
    console.log("✨ PATH updated and binaries verified.\n");
  } catch (e) {
    console.error("💥 Postinstall failed:", e.message);
  }
})();
