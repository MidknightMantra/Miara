// ===============================
// Miara by MidknightMantra
// ===============================

import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import cfonts from 'cfonts';
import readline from 'readline';
import yargs from 'yargs';
import chalk from 'chalk';
import fs from 'fs';
import './config.js';

// --- Setup paths and environment ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { say } = cfonts;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isRunning = false;
let childProcess = null;

// Helper function for user input
const ask = (text) => new Promise((resolve) => rl.question(text, resolve));

console.log(chalk.yellow.bold('—◉ Initializing system...'));

// --- Step 1: Ensure authentication folder exists ---
function ensureAuthFolderExists() {
  const authPath = join(__dirname, global.authFile);
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
}

// --- Step 2: Check for credentials file ---
function hasCredentialsFile() {
  const credsPath = join(__dirname, global.authFile, 'creds.json');
  return fs.existsSync(credsPath);
}

// --- Step 3: Format phone numbers properly ---
function formatPhoneNumber(number) {
  let formatted = number.replace(/[^\d+]/g, ''); // Remove non-digits except '+'

  // Mexico-specific adjustments (for example)
  if (formatted.startsWith('+52') && !formatted.startsWith('+521')) {
    formatted = formatted.replace('+52', '+521');
  } else if (formatted.startsWith('52') && !formatted.startsWith('521')) {
    formatted = `+521${formatted.slice(2)}`;
  } else if (formatted.startsWith('52') && formatted.length >= 12) {
    formatted = `+${formatted}`;
  } else if (!formatted.startsWith('+')) {
    formatted = `+${formatted}`;
  }

  return formatted;
}

// --- Step 4: Validate number format ---
function isValidPhoneNumber(number) {
  const regex = /^\+\d{7,15}$/;
  return regex.test(number);
}

// --- Step 5: Start bot ---
async function startBot(file) {
  if (isRunning) return;
  isRunning = true;

  // Fancy startup banner
  say('Miara', {
    font: 'chrome',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  say('Bot created by Midknight Mantra', {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  ensureAuthFolderExists();

  // If credentials exist, skip setup
  if (hasCredentialsFile()) {
    const args = [join(__dirname, file), ...process.argv.slice(2)];
    setupMaster({ exec: args[0], args: args.slice(1) });
    startBotProcess(file);
    return;
  }

  // Otherwise, ask how the user wants to log in
  const option = await ask(
    chalk.yellowBright.bold('—◉ Choose a login method (enter the number only):\n') +
    chalk.white.bold('1. Using QR code\n2. Using 8-digit text code\n—> ')
  );

  if (option === '2') {
    const phone = await ask(
      chalk.yellowBright.bold('\n—◉ Enter your WhatsApp number:\n') +
      chalk.white.bold('Example: +254758925674\n—> ')
    );

    const formattedPhone = formatPhoneNumber(phone);

    if (!isValidPhoneNumber(formattedPhone)) {
      console.log(
        chalk.bgRed(chalk.white.bold('[ ERROR ] Invalid number format.')) +
        '\nMake sure your number starts with the country code.\n' +
        'Example: +254758925674\n'
      );
      process.exit(0);
    }

    process.argv.push('--phone=' + formattedPhone);
    process.argv.push('--method=code');
  } else if (option === '1') {
    process.argv.push('--method=qr');
  }

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });
  startBotProcess(file);
}

// --- Step 6: Fork the process (start child bot process) ---
function startBotProcess(file) {
  childProcess = fork();

  childProcess.on('message', (data) => {
    console.log(chalk.green.bold('—◉ MESSAGE RECEIVED:'), data);

    switch (data) {
      case 'reset':
        console.log(chalk.yellow.bold('—◉ Restart request received...'));
        childProcess.removeAllListeners();
        childProcess.kill('SIGTERM');
        isRunning = false;
        setTimeout(() => startBot(file), 1000);
        break;

      case 'uptime':
        childProcess.send(process.uptime());
        break;
    }
  });

  childProcess.on('exit', (code, signal) => {
    console.log(chalk.yellow.bold(`—◉ Bot process terminated (${code || signal})`));
    isRunning = false;
    childProcess = null;

    // Restart automatically if needed
    if (code !== 0 || signal === 'SIGTERM') {
      console.log(chalk.yellow.bold('—◉ Restarting bot...'));
      setTimeout(() => startBot(file), 1000);
    }
  });

  const options = yargs(process.argv.slice(2)).argv;
  if (!options.test) {
    rl.on('line', (line) => {
      childProcess.emit('message', line.trim());
    });
  }
}

// --- Step 7: Run everything ---
try {
  startBot('main.js');
} catch (error) {
  console.error(chalk.red.bold('[ CRITICAL ERROR ]:'), error);
  process.exit(1);
}
