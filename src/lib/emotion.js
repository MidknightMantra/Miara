/**
 * 🌸 Miara 🌸 — Emotion Detector (2025)
 * ---------------------------------------------------
 * Uses @vladmandic/face-api and TensorFlow.js to detect
 * emotions from faces in image buffers.
 *
 * Features:
 *  - Auto-downloads models if missing
 *  - Logs all inference steps via Miara's logger
 *  - Works in all environments (VPS, Heroku, Render, Local)
 *
 * by MidKnightMantra × GPT-5
 */

import * as tf from "@tensorflow/tfjs-node";
import * as faceapi from "@vladmandic/face-api";
import canvas from "canvas";
import path from "path";
import fs from "fs";
import { ensureModels } from "../utils/modelLoader.js";
import { logger } from "../utils/logger.js";

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;
let modelLoadError = null;

// ─────────────────────────────────────────────
// 🧠 Load Emotion Models (auto-download if missing)
// ─────────────────────────────────────────────
export async function loadModels() {
  if (modelsLoaded || modelLoadError) return;

  try {
    const modelPath = path.join(process.cwd(), "models");
    await ensureModels(); // download if missing

    if (!fs.existsSync(modelPath)) {
      modelLoadError = new Error("Model directory missing after ensureModels()");
      logger.error(modelLoadError.message, false, "Emotion");
      return;
    }

    logger.info("🧠 Loading Miara emotion models...", "Emotion");

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);

    modelsLoaded = true;
    logger.info("✅ Emotion models loaded successfully.", "Emotion");
  } catch (err) {
    modelLoadError = err;
    logger.error(`Failed to load models: ${err.message}`, false, "Emotion");
  }
}

// ─────────────────────────────────────────────
// 🎭 Detect Emotion from Image Buffer
// ─────────────────────────────────────────────
export async function detectEmotion(buffer) {
  if (!buffer || buffer.length < 1024) {
    logger.warn("Invalid or empty buffer provided for emotion detection.", "Emotion");
    return null;
  }

  try {
    // Ensure models are ready
    if (!modelsLoaded && !modelLoadError) await loadModels();
    if (modelLoadError) {
      logger.warn("Skipping emotion detection — models unavailable.", "Emotion");
      return null;
    }

    // Load image into canvas
    const img = await canvas.loadImage(buffer);

    // Run face + expression detection
    const detection = await faceapi.detectSingleFace(img).withFaceExpressions();

    if (!detection?.expressions) {
      logger.debug("No face or expressions detected.", "Emotion");
      return null;
    }

    // Sort emotions by confidence
    const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
    const [emotion, confidence] = sorted[0];

    if (confidence < 0.45) {
      logger.debug(
        `Low-confidence emotion: ${emotion} (${(confidence * 100).toFixed(1)}%)`,
        "Emotion"
      );
      return null;
    }

    logger.info(`Detected emotion: ${emotion} (${(confidence * 100).toFixed(1)}%)`, "Emotion");

    return emotion;
  } catch (err) {
    logger.warn(`Emotion detection failed: ${err.message}`, "Emotion");
    return null;
  }
}

// ─────────────────────────────────────────────
// 🌼 Utility — Force model preload at startup
// (optional, used in main.js for warm start)
// ─────────────────────────────────────────────
export async function preloadEmotionModels() {
  try {
    await loadModels();
  } catch (err) {
    logger.warn(`Preload failed: ${err.message}`, "Emotion");
  }
}
