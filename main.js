// =====================================
// Miara
// =====================================

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './config-theme.js';
import './api.js';

import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch,
} from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { format } from 'util';
import pino from 'pino';
import Pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './src/libraries/simple.js';
import { initializeSubBots } from './src/libraries/subBotManager.js';
import { Low, JSONFile } from 'lowdb';
import store from './src/libraries/store.js';
import LidResolver from './src/libraries/LidResolver.js';

const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC,
} = await import('baileys');
import readline from 'readline';
import NodeCache from 'node-cache';
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
let stopped = 'close';

protoType();
serialize();
const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix
    ? /file:\/\/\//.test(pathURL)
      ? fileURLToPath(pathURL)
      : pathURL
    : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.API = (name, pathName = '/', query = {}, apiKeyParam) =>
  (name in global.APIs ? global.APIs[name] : name) +
  pathName +
  (query || apiKeyParam
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apiKeyParam
            ? {
                [apiKeyParam]:
                  global.APIKeys[
                    name in global.APIs ? global.APIs[name] : name
                  ],
              }
            : {}),
        })
      )
    : '');

global.timestamp = { start: new Date() };
global.videoList = [];
global.videoListXXX = [];
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(
  yargs(process.argv.slice(2)).exitProcess(false).parse()
);
global.prefix = new RegExp('^[#!/.]');

// --- Initialize local database ---
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '')
    ? new cloudDBAdapter(opts['db'])
    : new JSONFile(
        `${opts._[0] ? opts._[0] + '_' : ''}database.json`
      )
);

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(
            global.db.data == null
              ? global.loadDatabase()
              : global.db.data
          );
        }
      }, 1000)
    );
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

/* ------------------------------------------------
   LID Data Manager
   ------------------------------------------------
   Helper class for managing cached LID data from JSON.
   Provides lookup, statistics, and filtering utilities.
--------------------------------------------------*/
class LidDataManager {
  constructor(cacheFile = './src/lidsresolve.json') {
    this.cacheFile = cacheFile;
  }

  /** Load LID data from JSON cache file */
  loadData() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('❌ Error loading LID cache:', error.message);
      return {};
    }
  }

  /** Get user info by LID number */
  getUserInfo(lidNumber) {
    const data = this.loadData();
    return data[lidNumber] || null;
  }

  /** Get user info by JID */
  getUserInfoByJid(jid) {
    const data = this.loadData();
    for (const [key, entry] of Object.entries(data)) {
      if (entry && entry.jid === jid) return entry;
    }
    return null;
  }

  /** Find LID by JID */
  findLidByJid(jid) {
    const data = this.loadData();
    for (const [key, entry] of Object.entries(data)) {
      if (entry && entry.jid === jid) return entry.lid;
    }
    return null;
  }

  /** List all valid users */
  getAllUsers() {
    const data = this.loadData();
    const users = [];

    for (const [key, entry] of Object.entries(data)) {
      if (entry && !entry.notFound && !entry.error) {
        users.push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          country: entry.country,
          phoneNumber: entry.phoneNumber,
          isPhoneDetected: entry.phoneDetected || entry.corrected,
          timestamp: new Date(entry.timestamp).toLocaleString(),
        });
      }
    }

    return users.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Retrieve statistics summary */
  getStats() {
    const data = this.loadData();
    let valid = 0,
      notFound = 0,
      errors = 0,
      phoneNumbers = 0,
      corrected = 0;

    for (const entry of Object.values(data)) {
      if (entry) {
        if (entry.phoneDetected || entry.corrected) phoneNumbers++;
        if (entry.corrected) corrected++;
        if (entry.notFound) notFound++;
        else if (entry.error) errors++;
        else valid++;
      }
    }

    return {
      total: Object.keys(data).length,
      valid,
      notFound,
      errors,
      phoneNumbers,
      corrected,
      cacheFile: this.cacheFile,
      fileExists: fs.existsSync(this.cacheFile),
    };
  }

  /** Retrieve users grouped by country */
  getUsersByCountry() {
    const data = this.loadData();
    const countries = {};

    for (const entry of Object.values(data)) {
      if (entry && !entry.notFound && !entry.error && entry.country) {
        if (!countries[entry.country]) countries[entry.country] = [];
        countries[entry.country].push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          phoneNumber: entry.phoneNumber,
        });
      }
    }

    // Sort each country's users alphabetically
    for (const country of Object.keys(countries)) {
      countries[country].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return countries;
  }
}

// Create LID manager instance
const lidDataManager = new LidDataManager();
/* ------------------------------------------------
   Text and Message Processing Utilities
   ------------------------------------------------
   These functions scan messages for “@LID”-style mentions
   and replace them with the corresponding real WhatsApp JIDs
   by consulting the LidResolver instance.
--------------------------------------------------*/

/** Process text to replace @LID mentions with real numbers */
async function processTextMentions(text, groupId, lidResolver) {
  if (!text || !groupId || !text.includes('@')) return text;

  try {
    // Comprehensive regex to match @12345678-style mentions
    const mentionRegex = /@(\d{8,20})/g;
    const mentions = [...text.matchAll(mentionRegex)];
    if (!mentions.length) return text;

    let processedText = text;
    const processedMentions = new Set();
    const replacements = new Map();

    for (const mention of mentions) {
      const [fullMatch, lidNumber] = mention;
      if (processedMentions.has(lidNumber)) continue;
      processedMentions.add(lidNumber);

      const lidJid = `${lidNumber}@lid`;

      try {
        const resolvedJid = await lidResolver.resolveLid(lidJid, groupId);

        if (
          resolvedJid &&
          resolvedJid !== lidJid &&
          !resolvedJid.endsWith('@lid')
        ) {
          const resolvedNumber = resolvedJid.split('@')[0];
          if (resolvedNumber && resolvedNumber !== lidNumber) {
            replacements.set(lidNumber, resolvedNumber);
          }
        }
      } catch (error) {
        console.error(`❌ Error resolving LID mention ${lidNumber}:`, error.message);
      }
    }

    // Apply all replacements globally
    for (const [lidNumber, resolvedNumber] of replacements.entries()) {
      const globalRegex = new RegExp(`@${lidNumber}\\b`, 'g');
      processedText = processedText.replace(globalRegex, `@${resolvedNumber}`);
    }

    return processedText;
  } catch (error) {
    console.error('❌ Error in processTextMentions:', error);
    return text;
  }
}

/** Recursively process message content for LID mentions */
async function processMessageContent(messageContent, groupChatId, lidResolver) {
  if (!messageContent || typeof messageContent !== 'object') return;

  const messageTypes = Object.keys(messageContent);

  for (const msgType of messageTypes) {
    const msgContent = messageContent[msgType];
    if (!msgContent || typeof msgContent !== 'object') continue;

    // Process main text
    if (typeof msgContent.text === 'string') {
      try {
        msgContent.text = await processTextMentions(
          msgContent.text,
          groupChatId,
          lidResolver
        );
      } catch (error) {
        console.error('❌ Error processing text:', error);
      }
    }

    // Process captions
    if (typeof msgContent.caption === 'string') {
      try {
        msgContent.caption = await processTextMentions(
          msgContent.caption,
          groupChatId,
          lidResolver
        );
      } catch (error) {
        console.error('❌ Error processing caption:', error);
      }
    }

    // Process context info recursively
    if (msgContent.contextInfo) {
      await processContextInfo(msgContent.contextInfo, groupChatId, lidResolver);
    }
  }
}

/** Recursively process contextInfo blocks for LID data */
async function processContextInfo(contextInfo, groupChatId, lidResolver) {
  if (!contextInfo || typeof contextInfo !== 'object') return;

  // Resolve mentionedJid array
  if (Array.isArray(contextInfo.mentionedJid)) {
    const resolvedMentions = [];
    for (const jid of contextInfo.mentionedJid) {
      if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
        try {
          const resolved = await lidResolver.resolveLid(jid, groupChatId);
          resolvedMentions.push(
            resolved && !resolved.endsWith('@lid') ? resolved : jid
          );
        } catch {
          resolvedMentions.push(jid);
        }
      } else {
        resolvedMentions.push(jid);
      }
    }
    contextInfo.mentionedJid = resolvedMentions;
  }

  // Resolve participant field
  if (typeof contextInfo.participant === 'string' && contextInfo.participant.endsWith?.('@lid')) {
    try {
      const resolved = await lidResolver.resolveLid(contextInfo.participant, groupChatId);
      if (resolved && !resolved.endsWith('@lid')) {
        contextInfo.participant = resolved;
      }
    } catch (error) {
      console.error('❌ Error resolving participant in contextInfo:', error);
    }
  }

  // Process quoted messages recursively
  if (contextInfo.quotedMessage) {
    await processMessageContent(contextInfo.quotedMessage, groupChatId, lidResolver);
  }

  // Process other possible text fields
  if (typeof contextInfo.stanzaId === 'string') {
    contextInfo.stanzaId = await processTextMentions(
      contextInfo.stanzaId,
      groupChatId,
      lidResolver
    );
  }
}

/** Fully process a message for display (resolves all nested LIDs) */
async function processMessageForDisplay(message, lidResolver) {
  if (!message || !lidResolver) return message;

  try {
    const processedMessage = JSON.parse(JSON.stringify(message)); // deep clone
    const groupChatId = message.key?.remoteJid?.endsWith?.('@g.us')
      ? message.key.remoteJid
      : null;

    if (!groupChatId) return processedMessage;

    // Resolve participant
    if (processedMessage.key?.participant?.endsWith?.('@lid')) {
      try {
        const resolved = await lidResolver.resolveLid(
          processedMessage.key.participant,
          groupChatId
        );
        if (
          resolved &&
          resolved !== processedMessage.key.participant &&
          !resolved.endsWith('@lid')
        ) {
          processedMessage.key.participant = resolved;
        }
      } catch (error) {
        console.error('❌ Error resolving participant:', error);
      }
    }

    // Resolve mentionedJid at root level
    if (Array.isArray(processedMessage.mentionedJid)) {
      const resolvedMentions = [];
      for (const jid of processedMessage.mentionedJid) {
        if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
          try {
            const resolved = await lidResolver.resolveLid(jid, groupChatId);
            resolvedMentions.push(
              resolved && !resolved.endsWith('@lid') ? resolved : jid
            );
          } catch {
            resolvedMentions.push(jid);
          }
        } else {
          resolvedMentions.push(jid);
        }
      }
      processedMessage.mentionedJid = resolvedMentions;
    }

    // Process the message body
    if (processedMessage.message) {
      await processMessageContent(
        processedMessage.message,
        groupChatId,
        lidResolver
      );
    }

    return processedMessage;
  } catch (error) {
    console.error('❌ Error processing message for display:', error);
    return message;
  }
}

/** Extract all text recursively from a message (for debugging) */
function extractAllText(message) {
  if (!message?.message) return '';
  let allText = '';

  const extractFromContent = (content) => {
    if (!content) return '';
    let text = '';

    if (content.text) text += content.text + ' ';
    if (content.caption) text += content.caption + ' ';

    if (content.contextInfo?.quotedMessage) {
      for (const quotedType of Object.keys(content.contextInfo.quotedMessage)) {
        const quotedContent = content.contextInfo.quotedMessage[quotedType];
        text += extractFromContent(quotedContent);
      }
    }
    return text;
  };

  for (const msgType of Object.keys(message.message)) {
    allText += extractFromContent(message.message[msgType]);
  }

  return allText.trim();
}

/** Intercept and process an array of messages safely */
async function interceptMessages(messages, lidResolver) {
  if (!Array.isArray(messages)) return messages;

  const processedMessages = [];

  for (const message of messages) {
    try {
      let processedMessage = message;

      // Run through lidResolver internal processor if available
      if (lidResolver && typeof lidResolver.processMessage === 'function') {
        try {
          processedMessage = await lidResolver.processMessage(message);
        } catch (error) {
          console.error('❌ Error in lidResolver.processMessage:', error);
        }
      }

      // Final display-ready processing
      processedMessage = await processMessageForDisplay(
        processedMessage,
        lidResolver
      );

      processedMessages.push(processedMessage);
    } catch (error) {
      console.error('❌ Error intercepting message:', error);
      processedMessages.push(message);
    }
  }

  return processedMessages;
}
/* ------------------------------------------------
   WhatsApp Connection Setup (Baileys)
   ------------------------------------------------
   This section configures Baileys, handles authentication
   via QR code or pairing code, and cleans console output.
--------------------------------------------------*/

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const versionLatest = await fetchLatestBaileysVersion();
console.log(versionLatest);

// Baileys version info override (fallback)
const version = [2, 3000, 1025190524];

// Extract phone number from arguments or global
let phoneNumber =
  global.botnumber ||
  process.argv.find((arg) => arg.startsWith('--phone='))?.split('=')[1];

// Connection method flags
const methodQRCode = process.argv.includes('--method=qr');
const methodCode = !!phoneNumber || process.argv.includes('--method=code');
const methodMobile = process.argv.includes('mobile');

// Command-line prompt setup
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (text) => new Promise((resolve) => rl.question(text, resolve));

let option;

// Determine login method
if (methodQRCode) option = '1';
if (!methodQRCode && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
  do {
    option = await ask(
      '[ ℹ️ ] Choose an option:\n1. With QR code\n2. With 8-digit text code\n---> '
    );
    if (!/^[1-2]$/.test(option)) {
      console.log('[ ⚠️ ] Please enter 1 or 2.\n');
    }
  } while (
    (option !== '1' && option !== '2') ||
    fs.existsSync(`./${global.authFile}/creds.json`)
  );
}

// Filter strings for sensitive Baileys debug logs (base64)
const filterStrings = [
  'Q2xvc2luZyBzdGFsZSBvcGVu', // "Closing stale open"
  'Q2xvc2luZyBvcGVuIHNlc3Npb24=', // "Closing open session"
  'RmFpbGVkIHRvIGRlY3J5cHQ=', // "Failed to decrypt"
  'U2Vzc2lvbiBlcnJvcg==', // "Session error"
  'RXJyb3I6IEJhZCBNQUM=', // "Error: Bad MAC"
  'RGVjcnlwdGVkIG1lc3NhZ2U=', // "Decrypted message"
];

// Silence Baileys noisy console output
console.info = () => {};
console.debug = () => {};
['log', 'warn', 'error'].forEach((methodName) => {
  const original = console[methodName];
  console[methodName] = function (...args) {
    const message = args[0];
    if (
      typeof message === 'string' &&
      filterStrings.some((filter) =>
        message.includes(Buffer.from(filter, 'base64').toString())
      )
    ) {
      args[0] = '';
    }
    original.apply(console, args);
  };
});

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (err) => {
  if (filterStrings.includes(Buffer.from(err.message).toString('base64'))) return;
  console.error('Uncaught Exception:', err);
});

// --- Connection Options for Baileys ---
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: option === '1' ? true : methodQRCode ? true : false,
  mobile: methodMobile,
  browser:
    option === '1'
      ? ['Miara', 'Safari', '2.0.0']
      : methodQRCode
      ? ['Miara', 'Safari', '2.0.0']
      : ['Ubuntu', 'Chrome', '20.0.04'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(
      state.keys,
      Pino({ level: 'fatal' }).child({ level: 'fatal' })
    ),
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => {
    try {
      const jid = jidNormalizedUser(key.remoteJid);
      const msg = await store.loadMessage(jid, key.id);
      return msg?.message || '';
    } catch {
      return '';
    }
  },
  msgRetryCounterCache: msgRetryCounterCache || new Map(),
  userDevicesCache: userDevicesCache || new Map(),
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => global.conn.chats[jid] ?? {},
  keepAliveIntervalMs: 55000,
  maxIdleTimeMs: 60000,
  version,
};

// Initialize connection
global.conn = makeWASocket(connectionOptions);
const lidResolver = new LidResolver(global.conn);

// Run silent background auto-correction on startup
setTimeout(async () => {
  try {
    if (lidResolver) {
      lidResolver.autoCorrectPhoneNumbers();
    }
  } catch (error) {
    console.error('❌ Initial analysis error:', error.message);
  }
}, 5000);

// Pairing code setup if creds.json doesn’t exist
if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
  if (option === '2' || methodCode) {
    option = '2';
    if (!conn.authState.creds.registered) {
      if (methodMobile)
        throw new Error('You cannot use a pairing code with the mobile API.');

      let userNumber;
      if (phoneNumber) {
        userNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some((v) => userNumber.startsWith(v))) {
          console.log(
            chalk.bgBlack(
              chalk.bold.redBright(
                'Please start your number with your country code.\nExample: +254758925674\n'
              )
            )
          );
          process.exit(0);
        }
      } else {
        // Ask for phone number interactively
        while (true) {
          userNumber = await ask(
            chalk.bgBlack(
              chalk.bold.yellowBright(
                'Please enter your WhatsApp number.\nExample: +254758925674\n'
              )
            )
          );
          userNumber = userNumber.replace(/[^0-9]/g, '');
          if (
            userNumber.match(/^\d+$/) &&
            Object.keys(PHONENUMBER_MCC).some((v) => userNumber.startsWith(v))
          )
            break;
          console.log(
            chalk.bgBlack(
              chalk.bold.redBright(
                'Invalid number format.\nExample: +254758925674.\n'
              )
            )
          );
        }
        rl.close();
      }

      // Request pairing code
      setTimeout(async () => {
        let code = await conn.requestPairingCode(userNumber);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        console.log(
          chalk.yellow('[ ℹ️ ] Enter this pairing code on WhatsApp:'),
          chalk.black(chalk.bgGreen(` ${code} `))
        );
      }, 3000);
    }
  }
}
/* ------------------------------------------------
   Connection Update & Error Handling
   ------------------------------------------------
   Monitors connection status, reconnects automatically,
   restarts the bot when necessary, and initializes sub-bots.
--------------------------------------------------*/

conn.isInit = false;
conn.well = false;
conn.logger.info(`[ ℹ️ ] Loading...\n`);

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp'] && (global.support || {}).find) {
        const tmpDirs = [os.tmpdir(), 'tmp', 'jadibts'];
        tmpDirs.forEach((dir) =>
          cp.spawn('find', [dir, '-amin', '3', '-type', 'f', '-delete'])
        );
      }
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

/** Remove temporary files older than 3 minutes */
function clearTmp() {
  const tmpDirs = [join(__dirname, './src/tmp')];
  const files = [];
  tmpDirs.forEach((dir) => readdirSync(dir).forEach((file) => files.push(join(dir, file))));
  return files.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3)
      return unlinkSync(file);
    return false;
  });
}

/** Delete any crash dump “core.xxx” files automatically */
const watchDir = path.join(__dirname, './');
function deleteCoreFiles(filePath) {
  const pattern = /^core\.\d+$/i;
  const filename = path.basename(filePath);
  if (pattern.test(filename)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting ${filePath}:`, err);
    });
  }
}
fs.watch(watchDir, (eventType, filename) => {
  if (eventType === 'rename') {
    const filePath = path.join(watchDir, filename);
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) deleteCoreFiles(filePath);
    });
  }
});

/** Remove “pre-key” session files */
function purgeSession() {
  const directory = './MiaraSession';
  const files = readdirSync(directory).filter((f) => f.startsWith('pre-key-'));
  files.forEach((file) => unlinkSync(`${directory}/${file}`));
}

/** Remove “pre-key” files from all sub-bot directories */
function purgeSessionSubBots() {
  try {
    const directories = readdirSync('./jadibts/');
    directories.forEach((dir) => {
      if (statSync(`./jadibts/${dir}`).isDirectory()) {
        const prekeys = readdirSync(`./jadibts/${dir}`).filter((f) =>
          f.startsWith('pre-key-')
        );
        prekeys.forEach((f) => unlinkSync(`./jadibts/${dir}/${f}`));
      }
    });
  } catch {
    console.log(chalk.bold.red(`[ ℹ️ ] Something went wrong — some files were not deleted.`));
  }
}

/** Remove old session files older than 1 hour */
function purgeOldFiles() {
  const dirs = ['./MysticSession/', './jadibts/'];
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  dirs.forEach((dir) => {
    readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = statSync(filePath);
      if (
        stats.isFile() &&
        stats.mtimeMs < oneHourAgo &&
        file !== 'creds.json'
      ) {
        unlinkSync(filePath);
      }
    });
  });
}

/** Main connection status handler */
async function connectionUpdate(update) {
  let isFirstConnection = '';
  let qrAlreadyShown = false;
  let qrTimeout = null;

  const { connection, lastDisconnect, isNewLogin } = update;
  stopped = connection;
  if (isNewLogin) conn.isInit = true;

  const code =
    lastDisconnect?.error?.output?.statusCode ||
    lastDisconnect?.error?.output?.payload?.statusCode;

  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date();
  }

  if (global.db.data == null) loadDatabase();

  // Show QR when needed
  if ((update.qr != 0 && update.qr != undefined) || methodQRCode) {
    if (option === '1' || methodQRCode) {
      console.log(chalk.yellow('[ ℹ️ ] Scan the QR code.'));
      qrAlreadyShown = true;
      if (qrTimeout) clearTimeout(qrTimeout);
      qrTimeout = setTimeout(() => (qrAlreadyShown = false), 60000);
    }
  }

  // When connection opens successfully
  if (connection === 'open') {
    console.log(chalk.yellow('[ ℹ️ ] Connected successfully.'));
    isFirstConnection = true;
    if (!global.subBotsInitialized) {
      global.subBotsInitialized = true;
      try {
        await initializeSubBots();
      } catch (error) {
        console.error(chalk.red('[ ⚠️ ] Failed to initialize sub-bots:'), error);
      }
    }
  }

  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  const errorCounters = {};

  function shouldLogError(type) {
    if (!errorCounters[type]) errorCounters[type] = { count: 0, lastShown: 0 };
    const now = Date.now();
    const data = errorCounters[type];
    if (data.count >= 5) return false;
    if (now - data.lastShown < 2000) return false;
    data.count++;
    data.lastShown = now;
    return true;
  }

  // Handle disconnection reasons
  if (reason === 405) {
    console.log(
      chalk.bold.redBright(
        `[ ⚠️ ] Connection replaced — restarting...\nIf errors appear, restart manually with: npm start`
      )
    );
  }

  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      if (shouldLogError('badSession')) {
        conn.logger.error(
          `[ ⚠️ ] Invalid session. Please delete the ${global.authFile} folder and rescan.`
        );
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionClosed) {
      if (shouldLogError('connectionClosed'))
        conn.logger.warn(`[ ⚠️ ] Connection closed. Reconnecting...`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      if (shouldLogError('connectionLost'))
        conn.logger.warn(`[ ⚠️ ] Connection lost. Reconnecting...`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
      if (shouldLogError('connectionReplaced'))
        conn.logger.error(
          `[ ⚠️ ] Connection replaced. Another session is open. Please close it first.`
        );
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.loggedOut) {
      if (shouldLogError('loggedOut'))
        conn.logger.error(
          `[ ⚠️ ] Logged out. Please delete the ${global.authFile} folder and rescan.`
        );
    } else if (reason === DisconnectReason.restartRequired) {
      if (isFirstConnection) {
        // ignore first-time false restart
        isFirstConnection = false;
      } else {
        if (shouldLogError('restartRequired'))
          conn.logger.info(`[ ⚠️ ] Restart required. Reconnecting...`);
        await global.reloadHandler(true).catch(console.error);
      }
    } else if (reason === DisconnectReason.timedOut) {
      if (shouldLogError('timedOut'))
        conn.logger.warn(`[ ⚠️ ] Connection timed out. Reconnecting...`);
      await global.reloadHandler(true).catch(console.error);
    } else {
      const unknown = `unknown_${reason || ''}_${connection || ''}`;
      if (shouldLogError(unknown))
        conn.logger.warn(
          `[ ⚠️ ] Unknown disconnect reason. ${reason || ''}: ${connection || ''}`
        );
      await global.reloadHandler(true).catch(console.error);
    }
  }
}

// Global uncaught error handling
process.on('uncaughtException', console.error);
/* ------------------------------------------------
   Handler Reload System & Plugin Loader
   ------------------------------------------------
   Allows live reloading of command handlers and plugins
   without restarting the bot.
--------------------------------------------------*/

let isInit = true;
let handler = await import('./handler.js');

// Reload handler (hot swap)
global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }

  if (restartConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch {}
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    store?.bind(conn);
    lidResolver.conn = global.conn;
    isInit = true;
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('group-participants.update', conn.participantsUpdate);
    conn.ev.off('groups.update', conn.groupsUpdate);
    conn.ev.off('message.delete', conn.onDelete);
    conn.ev.off('call', conn.onCall);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  // Group messages
  conn.welcome = '👋 Welcome!\n@user';
  conn.bye = '👋 Goodbye!\n@user';
  conn.spromote = '*[ ℹ️ ] @user was promoted to admin.*';
  conn.sdemote = '*[ ℹ️ ] @user was demoted from admin.*';
  conn.sDesc = '*[ ℹ️ ] Group description was changed.*';
  conn.sSubject = '*[ ℹ️ ] Group name was changed.*';
  conn.sIcon = '*[ ℹ️ ] Group profile picture updated.*';
  conn.sRevoke = '*[ ℹ️ ] Group invite link was reset.*';

  // Wrap handler with LID-processing interceptor
  const originalHandler = handler.handler.bind(global.conn);
  conn.handler = async function (chatUpdate) {
    try {
      if (chatUpdate.messages) {
        chatUpdate.messages = await interceptMessages(chatUpdate.messages, lidResolver);

        // Double-check group LID mentions
        for (let i = 0; i < chatUpdate.messages.length; i++) {
          const message = chatUpdate.messages[i];
          if (message?.key?.remoteJid?.endsWith('@g.us')) {
            try {
              const fullyProcessed = await processMessageForDisplay(message, lidResolver);
              chatUpdate.messages[i] = fullyProcessed;

              const text = extractAllText(fullyProcessed);
              if (text && text.includes('@') && /(@\d{8,20})/.test(text)) {
                // Potential unresolved LIDs (silent)
              }
            } catch (err) {
              console.error('❌ Error during final message processing:', err);
            }
          }
        }
      }

      return await originalHandler(chatUpdate);
    } catch (err) {
      console.error('❌ Error in handler interceptor:', err);
      return await originalHandler(chatUpdate);
    }
  };

  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.onCall = handler.callUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('call', conn.onCall);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);

  isInit = false;
  return true;
};

/* ------------------------------------------------
   LID Utilities for Plugins
--------------------------------------------------*/
conn.lid = {
  getUserInfo: (lidNumber) => lidDataManager.getUserInfo(lidNumber),
  getUserInfoByJid: (jid) => lidDataManager.getUserInfoByJid(jid),
  findLidByJid: (jid) => lidDataManager.findLidByJid(jid),
  getAllUsers: () => lidDataManager.getAllUsers(),
  getStats: () => lidDataManager.getStats(),
  getUsersByCountry: () => lidDataManager.getUsersByCountry(),
  validatePhoneNumber: (phone) =>
    lidResolver.phoneValidator?.isValidPhoneNumber(phone) ?? false,
  detectPhoneInLid: (lid) =>
    lidResolver.phoneValidator?.detectPhoneInLid(lid) ?? { isPhone: false },
  forceSave: () => {
    try {
      lidResolver.forceSave();
      return true;
    } catch (err) {
      console.error('Error saving LID cache:', err);
      return false;
    }
  },
  getCacheInfo: () => {
    try {
      const stats = lidDataManager.getStats();
      const analysis = lidResolver.analyzePhoneNumbers();
      return `📱 *LID CACHE STATS*

📊 *General:*
• Total entries: ${stats.total}
• Valid: ${stats.valid}
• Not found: ${stats.notFound}
• Errors: ${stats.errors}

📞 *Phone Numbers:*
• Detected: ${stats.phoneNumbers}
• Corrected: ${stats.corrected}
• Problematic: ${analysis.stats.phoneNumbersProblematic}

🗂️ *Cache File:*
• Path: ${stats.cacheFile}
• Exists: ${stats.fileExists ? 'Yes' : 'No'}

🌍 *Countries:*
${Object.entries(lidDataManager.getUsersByCountry())
  .slice(0, 5)
  .map(([country, users]) => `• ${country}: ${users.length} users`)
  .join('\n')}`;
    } catch (err) {
      return `❌ Error retrieving cache info: ${err.message}`;
    }
  },
  forcePhoneCorrection: () => {
    try {
      const result = lidResolver.autoCorrectPhoneNumbers();
      return result.corrected > 0
        ? `✅ ${result.corrected} phone numbers corrected automatically.`
        : '✅ No phone numbers required correction.';
    } catch (err) {
      return `❌ Auto-correction error: ${err.message}`;
    }
  },
  resolveLid: async (lidJid, groupId) => {
    try {
      return await lidResolver.resolveLid(lidJid, groupId);
    } catch (err) {
      console.error('Error resolving LID:', err);
      return lidJid;
    }
  },
  processTextMentions: async (text, groupId) => {
    try {
      return await processTextMentions(text, groupId, lidResolver);
    } catch (err) {
      console.error('Error processing mentions:', err);
      return text;
    }
  },
};

/* ------------------------------------------------
   Plugin Loader (auto-reload on save)
--------------------------------------------------*/
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (err) {
      conn.logger.error(err);
      delete global.plugins[filename];
    }
  }
}
filesInit().then(() => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`Updated plugin: '${filename}'`);
      else {
        conn.logger.warn(`Deleted plugin: '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`New plugin detected: '${filename}'`);

    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`Syntax error in '${filename}'\n${format(err)}`);
    else {
      try {
        const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`Error loading plugin '${filename}':\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(
          Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        );
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

/* ------------------------------------------------
   Periodic Tasks
--------------------------------------------------*/

// Clean temp folder every 3 minutes
setInterval(async () => {
  if (stopped === 'close' || !conn?.user) return;
  await clearTmp();
}, 180000);

// Update status every minute
setInterval(async () => {
  if (stopped === 'close' || !conn?.user) return;
  const uptime = process.uptime() * 1000;
  const time = clockString(uptime);
  const bio = `• Active: ${time} | TheMystic-Bot-MD`;
  await conn.updateProfileStatus(bio).catch(() => {});
}, 60000);

// LID cache cleanup every 30 minutes
setInterval(async () => {
  if (stopped === 'close' || !conn?.user || !lidResolver) return;
  try {
    const stats = lidDataManager.getStats();
    if (stats.total > 800) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      let cleaned = 0;
      for (const [key, entry] of lidResolver.cache.entries()) {
        if (entry.timestamp < sevenDaysAgo && (entry.notFound || entry.error)) {
          lidResolver.cache.delete(key);
          if (entry.jid && lidResolver.jidToLidMap.has(entry.jid))
            lidResolver.jidToLidMap.delete(entry.jid);
          cleaned++;
        }
      }
      if (cleaned > 0) lidResolver.markDirty();
    }
    if (Math.random() < 0.1) lidResolver.autoCorrectPhoneNumbers();
  } catch (err) {
    console.error('❌ LID cache cleanup error:', err.message);
  }
}, 30 * 60 * 1000);

/* ------------------------------------------------
   Utility & Graceful Shutdown
--------------------------------------------------*/
function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

const gracefulShutdown = () => {
  if (lidResolver?.isDirty) {
    try {
      lidResolver.forceSave();
    } catch (err) {
      console.error('❌ Error saving LID cache on exit:', err.message);
    }
  }
};

process.on('exit', gracefulShutdown);
process.on('SIGINT', () => { gracefulShutdown(); process.exit(0); });
process.on('SIGTERM', () => { gracefulShutdown(); process.exit(0); });
process.on('unhandledRejection', (reason) => {
  if (reason?.message?.includes('lid'))
    console.error('❌ Unhandled LID-related error:', reason);
});

/* ------------------------------------------------
   Quick Environment Test
--------------------------------------------------*/
async function _quickTest() {
  const binaries = ['ffmpeg','ffprobe','convert','magick','gm','find'];
  const results = await Promise.all(
    binaries.map((cmd) =>
      new Promise((resolve) => {
        const p = spawn(cmd, ['--version']);
        p.on('close', (code) => resolve(code !== 127));
        p.on('error', () => resolve(false));
      })
    )
  );
  const [ffmpeg, ffprobe, convert, magick, gm, find] = results;
  global.support = { ffmpeg, ffprobe, convert, magick, gm, find };
  Object.freeze(global.support);
}
