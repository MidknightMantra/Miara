/**
 * exif utilities (sticker metadata, conversions)
 * Uses sharp for image processing and metadata injection.
 */

import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import os from "os";
import child_process from "child_process";
import sharp from "sharp";

const exec = promisify(child_process.exec);

/**
 * Generates the EXIF buffer for WhatsApp sticker metadata.
 * @param {object} metadata - Metadata object containing packname and author.
 * @param {string} metadata.packname - The sticker pack name.
 * @param {string} metadata.author - The sticker author name.
 * @returns {Buffer} The EXIF buffer.
 */
function createExifBuffer(metadata = {}) {
  const { packname = "MyStickerPack", author = "MiaraBot" } = metadata;

  const json = {
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
    "sticker-pack-id": "", // Optional, can be a UUID or left empty
  };

  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
  const lenBuffer = Buffer.alloc(4);
  lenBuffer.writeUInt32LE(jsonBuffer.length, 0);
  const exif = Buffer.concat([exifAttr, lenBuffer, jsonBuffer, Buffer.from([0x00, 0x00])]); // Trailing zeros for padding

  return exif;
}

/**
 * Adds EXIF metadata to an existing WebP buffer using webpmux.
 * Assumes libwebp (webpmux) is installed on the system.
 * @param {Buffer} webpBuffer - The input WebP buffer.
 * @param {object} metadata - Metadata object containing packname and author.
 * @param {string} metadata.packname - The sticker pack name.
 * @param {string} metadata.author - The sticker author name.
 * @returns {Promise<Buffer>} A promise resolving to the WebP buffer with added metadata.
 */
async function writeExif(webpBuffer, metadata = {}) {
  try {
    const tempDir = os.tmpdir();
    const tempWebpPath = path.join(tempDir, `webp_${Date.now()}.webp`);
    const tempExifPath = path.join(tempDir, `exif_${Date.now()}.exif`);
    const tempOutputPath = path.join(tempDir, `output_${Date.now()}.webp`);

    // Write input WebP and EXIF to temp files
    await fs.writeFile(tempWebpPath, webpBuffer);
    const exifBuffer = createExifBuffer(metadata);
    await fs.writeFile(tempExifPath, exifBuffer);

    // Use webpmux to add EXIF
    const command = `webpmux -set exif ${tempExifPath} ${tempWebpPath} -o ${tempOutputPath}`;
    await exec(command);

    // Read the output
    const webpWithExif = await fs.readFile(tempOutputPath);

    // Clean up temp files
    await Promise.all([
      fs.unlink(tempWebpPath),
      fs.unlink(tempExifPath),
      fs.unlink(tempOutputPath),
    ]);

    return webpWithExif;
  } catch (error) {
    console.error("Error writing EXIF to WebP:", error);
    throw error;
  }
}

/**
 * Converts an image buffer to WebP format with optional EXIF metadata.
 * @param {Buffer} imageBuffer - The input image buffer (e.g., PNG, JPG).
 * @param {object} metadata - Metadata object containing packname and author.
 * @param {string} metadata.packname - The sticker pack name.
 * @param {string} metadata.author - The sticker author name.
 * @returns {Promise<Buffer>} A promise resolving to the WebP buffer with metadata.
 */
export async function imageToWebp(imageBuffer, metadata = {}) {
  try {
    // Use sharp to convert to WebP
    const webpBuffer = await sharp(imageBuffer)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }) // Resize for sticker specs
      .webp({ quality: 80 })
      .toBuffer();

    // Add EXIF metadata
    return await writeExif(webpBuffer, metadata);
  } catch (error) {
    console.error("Error converting image to WebP with EXIF:", error);
    throw error;
  }
}

/**
 * Converts a video buffer to WebP format (animated sticker) with optional EXIF metadata.
 * Uses ffmpeg for conversion (assumes ffmpeg is installed).
 * @param {Buffer} videoBuffer - The input video buffer.
 * @param {object} metadata - Metadata object containing packname and author.
 * @param {string} metadata.packname - The sticker pack name.
 * @param {string} metadata.author - The sticker author name.
 * @returns {Promise<Buffer>} A promise resolving to the WebP buffer with metadata.
 */
export async function videoToWebp(videoBuffer, metadata = {}) {
  try {
    const tempDir = os.tmpdir();
    const tempInputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
    const tempOutputPath = path.join(tempDir, `output_${Date.now()}.webp`);

    // Write input video to temp file
    await fs.writeFile(tempInputPath, videoBuffer);

    // ffmpeg command for converting to animated WebP
    const ffmpegArgs = [
      "-i",
      tempInputPath,
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
      "-loop",
      "0",
      "-ss",
      "00:00:00",
      "-t",
      "10", // Limit to 10 seconds
      "-preset",
      "default",
      "-an", // No audio
      "-vsync",
      "0",
      "-f",
      "webp",
      tempOutputPath,
    ].join(" ");

    await exec(`ffmpeg ${ffmpegArgs}`);

    // Read the WebP buffer
    let webpBuffer = await fs.readFile(tempOutputPath);

    // Clean up temp files
    await Promise.all([fs.unlink(tempInputPath), fs.unlink(tempOutputPath)]);

    // Add EXIF metadata
    return await writeExif(webpBuffer, metadata);
  } catch (error) {
    console.error("Error converting video to WebP with EXIF:", error);
    throw error;
  }
}

/**
 * Writes EXIF metadata to an *existing* WebP buffer.
 * @param {Buffer} webpBuffer - The input WebP buffer.
 * @param {object} metadata - Metadata object containing packname and author.
 * @param {string} metadata.packname - The sticker pack name.
 * @param {string} metadata.author - The sticker author name.
 * @returns {Promise<Buffer>} A promise resolving to the WebP buffer with added metadata.
 */
export async function writeExifImg(webpBuffer, metadata = {}) {
  return await writeExif(webpBuffer, metadata);
}

/**
 * Writes EXIF metadata to an *existing* WebP buffer (intended for video stickers).
 * @param {Buffer} webpBuffer - The input WebP buffer (e.g., from a video conversion).
 * @param {object} metadata - Metadata object containing packname and author.
 * @param {string} metadata.packname - The sticker pack name.
 * @param {string} metadata.author - The sticker author name.
 * @returns {Promise<Buffer>} A promise resolving to the WebP buffer with added metadata.
 */
export async function writeExifVid(webpBuffer, metadata = {}) {
  return await writeExif(webpBuffer, metadata);
}