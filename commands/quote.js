const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
  ComponentType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Provide a quote with a price, summary, and queue position')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user receiving the quote')
        .setRequired(true))
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
        content: 'You lack the required permissions to use this command.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const price = interaction.options.getNumber('price');
    const summary = interaction.options.getString('summary');
    const queue = interaction.options.getNumber('queue');

    // ToS Embed
    const tosEmbed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle('Terms of Service - Syncful\'s Development')
      .setDescription(
`**Use of Services**
Our services - including but not limited to EUP model development and software development - are provided for lawful, ethical, and respectful use only.

**Prohibited Use Includes:**
- Unlocking, reselling, or redistributing content
- Uploading/distributing harmful or unauthorized software
- Using assets illegally or unethically

**Intellectual Property**
- Our creations are ours unless stated otherwise
- You cannot claim, resell, or redistribute without permission

**User Contributions**
Shared content grants us rights to use it for improvement. You must have rights to what you share.

**Licensing**
Every asset may come with licensing terms. Violating them may result in legal action.

**Disclaimer & Liability**
All services are provided "as is". We are not liable for damages from usage.

**Termination**
We may ban/suspend users who breach these terms.

Click "I Agree" to proceed.

_Syncful's Development Team (c) 2025_`);

    const agreeButton = new ButtonBuilder()
      .setCustomId('agree')
      .setLabel('I Agree')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(agreeButton);

    const tosMessage = await interaction.reply({
      content: `${user}`,
      embeds: [tosEmbed],
      components: [row],
    });

    const collector = tosMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on('collect', async i => {
      if (i.user.id !== user.id) {
        return i.reply({ content: 'You are not authorized to use this button.', ephemeral: true });
      }

      if (i.customId === 'agree') {
        await i.deferUpdate();

        // Delete the ToS embed
        await i.message.delete();

        // Payment Embed
        const paymentEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Syncful Designs - Commission Quote')
          .setDescription('Thank you for choosing Syncful\'s Designs for your EUP adventures.')
          .addFields(
            { name: 'Due Amount', value: `${price} GBP` },
            { name: 'Product(s)', value: summary },
            { name: 'Payment Link', value: '[Pay Here](https://paypal.me/yourlink)' },
            { name: 'Next Step', value: 'After payment, click the "Paid" button below to confirm.' }
          )
          .setFooter({ text: 'Thank you for your order!', iconURL: interaction.client.user.avatarURL() })
          .setTimestamp();

        const paidButton = new ButtonBuilder()
          .setCustomId('paid')
          .setLabel('Paid')
          .setStyle(ButtonStyle.Primary);

        const payRow = new ActionRowBuilder().addComponents(paidButton);

        const paymentMsg = await interaction.channel.send({
          content: `${user}`,
          embeds: [paymentEmbed],
          components: [payRow],
        });

        const payCollector = paymentMsg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 300000,
        });

        payCollector.on('collect', async p => {
          if (p.user.id !== user.id) {
            return p.reply({ content: 'You are not authorized to use this button.', ephemeral: true });
          }

          if (p.customId === 'paid') {
            await p.deferUpdate();
            await p.message.delete();

            const finalEmbed = new EmbedBuilder()
              .setColor('#00cc66')
              .setTitle('Payment Confirmed')
              .setDescription(`Your payment has been confirmed.\nYou are number **${queue}** in the queue.\nWe will begin work shortly.`)
              .setFooter({ text: 'Syncful\'s Development' })
              .setTimestamp();

            await interaction.channel.send({
              content: `${user}`,
              embeds: [finalEmbed],
            });
          }
        });
      }
    });
  },
};
