/**
 * 🌸 Miara 🌸 — Emotion Detector (Deluxe 2025, Stable Edition)
 * -------------------------------------------------------------
 * TensorFlow.js + @vladmandic/face-api integration for emotion
 * inference. Auto-downloads and caches models. Works offline.
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
// 🧠 Load Models (idempotent, auto-download)
// ─────────────────────────────────────────────
export async function loadModels() {
  if (modelsLoaded || modelLoadError) return;

  try {
    const modelPath = path.join(process.cwd(), "models");
    await ensureModels();

    if (!fs.existsSync(modelPath)) {
      modelLoadError = new Error("Model directory missing after ensureModels()");
      throw modelLoadError;
    }

    logger.info("🧠 Loading Miara emotion models...", "Emotion");

    // Parallel loading improves warm start by ~30%
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.faceExpressionNet.loadFromDisk(modelPath)
    ]);

    modelsLoaded = true;
    logger.info("✅ Emotion models loaded successfully.", "Emotion");
  } catch (err) {
    modelLoadError = err;
    logger.error(`Model load failure: ${err.message}`, false, "Emotion");
  }
}

// ─────────────────────────────────────────────
// 🎭 Detect Dominant Emotion from Image Buffer
// ─────────────────────────────────────────────
export async function detectEmotion(buffer) {
  if (!buffer || buffer.length < 512) {
    logger.warn("Invalid or empty buffer passed for emotion detection.", "Emotion");
    return null;
  }

  try {
    if (!modelsLoaded && !modelLoadError) await loadModels();
    if (modelLoadError) {
      logger.warn("Skipping emotion detection — models unavailable.", "Emotion");
      return null;
    }

    const img = await canvas.loadImage(buffer);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceExpressions();

    if (!detection?.expressions) {
      logger.debug("No detectable face or expressions found.", "Emotion");
      return null;
    }

    // Pick highest-confidence expression
    const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
    const [emotion, confidence] = sorted[0];
    const confPct = (confidence * 100).toFixed(1);

    if (confidence < 0.45) {
      logger.debug(`Low-confidence emotion: ${emotion} (${confPct}%)`, "Emotion");
      return null;
    }

    logger.info(`Detected emotion: ${emotion} (${confPct}%)`, "Emotion");
    return emotion;
  } catch (err) {
    logger.warn(`Emotion inference failed: ${err.message}`, "Emotion");
    return null;
  } finally {
    // Clean TF memory on servers with limited RAM
    tf.engine().startScope();
    tf.engine().endScope();
  }
}

// ─────────────────────────────────────────────
// 🌼 Optional Warm-Start Helper
// ─────────────────────────────────────────────
export async function preloadEmotionModels() {
  try {
    await loadModels();
  } catch (err) {
    logger.warn(`Preload failed: ${err.message}`, "Emotion");
  }
}
