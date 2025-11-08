/**
 * 🌸 Miara 🌸 — Model Autoloader (2025)
 * -------------------------------------------------
 * Ensures that all required FaceAPI/TensorFlow models
 * are present locally. If missing, they are downloaded
 * automatically from the official GitHub/CDN mirror.
 *
 * by MidKnightMantra × GPT-5
 */

import fs from "fs";
import path from "path";
import https from "https";
import { logger } from "./logger.js";

// ─────────────────────────────
// 📦 Model metadata registry
// (Add more models as needed.)
// ─────────────────────────────
const MODEL_BASE_URL = "https://github.com/vladmandic/face-api/raw/master/model/";
const MODEL_FILES = [
  "ssd_mobilenetv1_model-weights_manifest.json",
  "ssd_mobilenetv1_model-shard1",
  "face_expression_model-weights_manifest.json",
  "face_expression_model-shard1"
];

// ─────────────────────────────
// 🧭 Local model directory
// ─────────────────────────────
const MODEL_DIR = path.join(process.cwd(), "models");

// ─────────────────────────────
// 🌐 File downloader
// ─────────────────────────────
async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

// ─────────────────────────────
// 🧠 Auto Model Loader
// ─────────────────────────────
export async function ensureModels() {
  try {
    if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR, { recursive: true });

    const missing = MODEL_FILES.filter((f) => !fs.existsSync(path.join(MODEL_DIR, f)));

    if (missing.length === 0) {
      logger.info("✅ All emotion models already present.", "ModelLoader");
      return MODEL_DIR;
    }

    logger.info(`📥 Downloading ${missing.length} model file(s) to ${MODEL_DIR}...`, "ModelLoader");

    for (const file of missing) {
      const url = `${MODEL_BASE_URL}${file}`;
      const dest = path.join(MODEL_DIR, file);
      logger.debug(`Fetching ${file} ...`, "ModelLoader");
      await downloadFile(url, dest);
      logger.debug(`✔️ ${file} saved.`, "ModelLoader");
    }

    logger.info("🧠 All models downloaded successfully.", "ModelLoader");
    return MODEL_DIR;
  } catch (err) {
    logger.error(`Model autoload failed: ${err.message}`, false, "ModelLoader");
    throw err;
  }
}
