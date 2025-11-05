/**
 * 🌸 Miara Helpers
 * Misc utilities used across the bot.
 */

import fs from "fs";
import path from "path";
import PhoneNumber from "awesome-phonenumber";
import * as fileType from "file-type"; // universal import works in Baileys 7+

export const smsg = (conn, m) => {
  try {
    const M = m.messages ? m.messages[0] : m;
    const msg = M.message || {};
    const messageType = Object.keys(msg)[0];
    const content = msg[messageType] || {};
    const quoted =
      content.contextInfo && content.contextInfo.quotedMessage
        ? content.contextInfo.quotedMessage
        : null;

    return {
      key: M.key,
      id: M.key.id,
      from: M.key.remoteJid,
      sender: M.key.participant || M.key.remoteJid,
      isGroup: M.key.remoteJid.endsWith("@g.us"),
      pushName: M.pushName || "",
      text: msg.conversation || content.caption || content.text || "",
      mime: content.mimetype || "",
      quoted,
      message: M,
    };
  } catch {
    return {};
  }
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const getBuffer = async (url) => {
  const fetch = (await import("node-fetch")).default;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return Buffer.from(await res.arrayBuffer());
};

export const getSizeMedia = (buf) => Buffer.byteLength(buf);

export const detectFileType = async (buf) => {
  const type = await fileType.fileTypeFromBuffer(buf);
  return type || { mime: "application/octet-stream", ext: "bin" };
};

export const isUrl = (t) => /^https?:\/\//i.test(t);

export const formatNumber = (jid) => {
  try {
    return new PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
      "international"
    );
  } catch {
    return jid;
  }
};

export async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}
