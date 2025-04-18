const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commands = new Map();

  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.set(command.data.name, command);
  }

  client.commands = commands;
};