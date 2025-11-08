/**
 * 🌸 Miara 🌸 — Artistic EXIF Engine (2025)
 * -------------------------------------------------------
 * Converts images & motion media into EXIF-embedded WebP stickers
 * with emotional captions and safe fallbacks.
 *
 * by MidKnightMantra × GPT-5
 */

import fs from "fs/promises";
import path from "path";
import os from "os";
import sharp from "sharp";
import { promisify } from "util";
import child_process from "child_process";
import { createCanvas, loadImage } from "canvas";
import { detectEmotion } from "./emotion.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

const exec = promisify(child_process.exec);

// ────────────────────────────────
// 🧠 Helper: Create EXIF metadata
// ────────────────────────────────
function createExifBuffer(metadata = {}) {
  const {
    packname = config.STICKER_PACK_NAME || "Miara Pack",
    author = config.STICKER_AUTHOR || "MidKnightMantra🌸"
  } = metadata;

  const json = {
    "sticker-pack-id": "com.miara.artstickers",
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00
  ]);

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const lenBuffer = Buffer.alloc(4);
  lenBuffer.writeUInt32LE(jsonBuffer.length, 0);

  return Buffer.concat([
    exifAttr,
    lenBuffer,
    jsonBuffer,
    Buffer.from([0x00, 0x00])
  ]);
}

// ────────────────────────────────
// 🧾 Write EXIF metadata via webpmux
// ────────────────────────────────
async function writeExif(webpBuffer, metadata = {}) {
  const tmp = os.tmpdir();
  const id = `miara_${Date.now()}`;
  const input = path.join(tmp, `${id}.webp`);
  const exifFile = path.join(tmp, `${id}.exif`);
  const output = path.join(tmp, `${id}_out.webp`);

  try {
    await fs.writeFile(input, webpBuffer);
    await fs.writeFile(exifFile, createExifBuffer(metadata));

    await exec(`webpmux -set exif ${exifFile} ${input} -o ${output}`);

    const result = await fs.readFile(output);
    await Promise.allSettled([
      fs.unlink(input),
      fs.unlink(exifFile),
      fs.unlink(output)
    ]);
    return result;
  } catch (err) {
    logger.warn(
      `webpmux unavailable — returning plain WebP (${err.message})`,
      "EXIF"
    );
    await Promise.allSettled([
      fs.unlink(input),
      fs.unlink(exifFile),
      fs.unlink(output)
    ]);
    return webpBuffer;
  }
}

// ────────────────────────────────
// 🎨 Artistic Caption Overlay
// ────────────────────────────────
async function addMiaraCaption(buffer) {
  try {
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);

    let caption = "✨ Miara Magic ✨";
    if (config.EMOTION_CAPTIONS) {
      try {
        const emotion = await detectEmotion(buffer);
        if (emotion) {
          const emojis = {
            happy: "😂 Mood",
            surprised: "😲 Shocked",
            angry: "😡 Mad vibes",
            sad: "💔 Feels",
            disgusted: "🤢 Ew moment",
            fearful: "😱 Scared",
            neutral: "😎 Chill"
          };
          caption = emojis[emotion] || caption;
          logger.debug(`Emotion detected: ${emotion} → ${caption}`, "EXIF");
        }
      } catch (err) {
        logger.warn(`Emotion detection failed: ${err.message}`, "EXIF");
      }
    }

    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, image.height - 80, 0, image.height);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, image.height - 80, image.width, 80);

    // Caption styling
    ctx.font = `bold ${Math.floor(image.height / 15)}px "Poppins", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 6;
    ctx.fillText(caption, image.width / 2, image.height - 25);

    return canvas.toBuffer("image/png");
  } catch (err) {
    logger.warn(`Caption overlay failed: ${err.message}`, "EXIF");
    return buffer;
  }
}

// ────────────────────────────────
// 🖼️ Image → WebP
// ────────────────────────────────
export async function imageToWebp(imageBuffer, metadata = {}, addCaption = true) {
  let processed = imageBuffer;
  if (addCaption) processed = await addMiaraCaption(imageBuffer);

  const webpBuffer = await sharp(processed)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 85 })
    .toBuffer();

  return await writeExif(webpBuffer, metadata);
}

// ────────────────────────────────
// 🎞️ Video / GIF → Animated WebP
// ────────────────────────────────
export async function motionToWebp(buffer, metadata = {}) {
  const tmp = os.tmpdir();
  const id = `miara_${Date.now()}`;
  const input = path.join(tmp, `${id}.src`);
  const output = path.join(tmp, `${id}.webp`);

  try {
    await fs.writeFile(input, buffer);

    let duration = 0;
    try {
      const { stdout } = await exec(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${input}"`
      );
      duration = parseFloat(stdout.trim()) || 0;
    } catch {
      /* ignore if ffprobe missing */
    }

    const trim = Math.min(duration || 8, 8);

    const cmd = [
      "ffmpeg",
      "-y",
      "-i",
      `"${input}"`,
      "-vf",
      `"scale=512:512:force_original_aspect_ratio=decrease,fps=15,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000"`,
      "-loop",
      "0",
      "-t",
      trim.toFixed(2),
      "-preset",
      "picture",
      "-an",
      "-vsync",
      "0",
      "-f",
      "webp",
      `"${output}"`
    ].join(" ");

    await exec(cmd);

    const webpBuffer = await fs.readFile(output);
    await Promise.allSettled([fs.unlink(input), fs.unlink(output)]);
    return await writeExif(webpBuffer, metadata);
  } catch (err) {
    logger.error(`motionToWebp failed: ${err.message}`, false, "EXIF");
    throw err;
  }
}

// ────────────────────────────────
// 🪄 Universal Converter
// ────────────────────────────────
export async function autoToWebp(buffer, mime = "", metadata = {}) {
  try {
    const isGif = mime === "image/gif";
    const isVideo = mime.startsWith("video/");
    const isImage = mime.startsWith("image/");

    if (isImage && !isGif) return await imageToWebp(buffer, metadata, true);
    if (isVideo || isGif) return await motionToWebp(buffer, metadata);
    throw new Error("Unsupported media type for sticker conversion.");
  } catch (err) {
    logger.error(`autoToWebp error: ${err.message}`, false, "EXIF");
    throw err;
  }
}

// ────────────────────────────────
// ✏️ Aliases
// ────────────────────────────────
export const videoToWebp = motionToWebp;
export const gifToWebp = motionToWebp;
export const writeExifImg = writeExif;
export const writeExifVid = writeExif;
