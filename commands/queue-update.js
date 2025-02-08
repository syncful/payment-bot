const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue-update')
    .setDescription('Update a user\'s queue position')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to update')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('slot')
        .setDescription('The new queue position')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const user = interaction.options.getUser('user');
    const slot = interaction.options.getNumber('slot');
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Queue Update')
      .setDescription(`Hello ${user}, your queue position has been updated.`)
      .addFields({ name: 'New Position', value: `You are now number ${slot} in the queue.` })
      .setTimestamp();

    await interaction.editReply({ content: `${user}`, embeds: [embed] });
  },
};
