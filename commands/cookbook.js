const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cookbook')
    .setDescription('takes a saved recipe and an input and bakes it using cyberchef')
    .addStringOption((option) => option
      .setName('remove')
      .setDescription('A recipe to remove')),

  async execute(interaction) {
    const db = require('..');

    const remove = interaction.options.getString('remove');
    if (typeof remove === 'string') {
      if (db.has(remove)) {
        db.delete(remove);
        return interaction.reply({ content: `Recipe ${remove} was removed from the cookbook` });
      }
      return interaction.reply({ content: 'Recipe not in cookbook', ephemeral: true });
    }

    const recipes = await db.all();
    if (recipes === false) {
      return interaction.reply({ content: 'Cookbook is empty', ephemeral: true });
    }

    const options = [];
    let iter = 1;
    Object.keys(recipes).forEach((name) => {
      options.push({
        label: name,
        description: `Recipe ${iter}`,
        value: name,
      });
      iter += 1;
    });

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('select')
          .setPlaceholder('Select a recipe')
          .addOptions(options),
      );

    return interaction.reply({ content: 'Recipe Book', components: [row] });
  },
};
