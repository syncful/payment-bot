const { Client, GatewayIntentBits, REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');

const TOKEN = 'BOT_TOKEN_HERE';
const CLIENT_ID = 'BOT_CLIENT_ID';
const GUILD_ID = 'GUILD_ID';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, './commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '9' }).setToken(TOKEN);
  const commandData = Array.from(commands.values()).map(command => command.data.toJSON());

  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commandData });
  console.log('Commands registered successfully.');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {

    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    if (interaction.deferred || interaction.replied) {

      await interaction.editReply({ content: 'An error occurred while executing this command.' });
    } else {

      await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
    }
  }
});

client.login(TOKEN);
