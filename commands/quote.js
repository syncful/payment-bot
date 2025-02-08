const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Provide a quote with a price, summary, and queue position')
    .addNumberOption(option =>
      option.setName('price')
        .setDescription('The price of the product')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('summary')
        .setDescription('A brief summary of the product')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('queue')
        .setDescription('Your position in the queue')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const price = interaction.options.getNumber('price');
    const summary = interaction.options.getString('summary');
    const queue = interaction.options.getNumber('queue');
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Syncful Designs - Commission Order')
      .setDescription('We appreciate you for choosing Syncful’s Designs for your EUP adventures.')
      .addFields(
        { name: 'Commission Status', value: `Your commission is number ${queue} in queue and we are awaiting your payment.` },
        { name: 'Due Amount', value: `£${price}` },
        { name: 'Product(s)', value: summary },
        { name: 'Payment Link', value: '[Pay Here](https://paypal.me/syncful)' },
        { name: 'Next Step', value: 'Once you have paid this quote in full, ping a member of staff and progress will begin.' }
      )
      .setFooter({ text: 'Thank you for your order!', iconURL: interaction.client.user.avatarURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
