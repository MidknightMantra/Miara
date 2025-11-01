const fs = require('fs');
const path = require('path');

const commands = {};

const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    commands[command.name] = command;
    if (command.aliases) {
        command.aliases.forEach(alias => {
            commands[alias] = command;
        });
    }
}

module.exports = commands;
