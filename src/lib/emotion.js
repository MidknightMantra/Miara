/**
 * 🌸 Miara 🌸— Emotion Detector (2025)
 * -----------------------------------
 */
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api";
import canvas from "canvas";
import path from "path";
import fs from "fs";

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  const modelPath = path.join(process.cwd(), "models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
  modelsLoaded = true;
  console.log("🧠 Emotion models loaded.");
}

/**
 * Detects dominant emotion from an image buffer.
 * Returns an emotion label or null.
 */
export async function detectEmotion(buffer) {
  try {
    if (!modelsLoaded) await loadModels();
    const img = await canvas.loadImage(buffer);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceExpressions();

    if (!detection?.expressions) return null;

    const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
    const [emotion, confidence] = sorted[0];
    if (confidence < 0.5) return null; // low confidence
    return emotion;
  } catch (err) {
    console.warn("⚠️ Emotion detection failed:", err.message);
    return null;
  }
}
