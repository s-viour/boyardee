const { SlashCommandBuilder } = require('@discordjs/builders');
const chef = require('cyberchef');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bake')
        .setDescription('takes a recipe and an input string and processes it with cyberchef')
        .addStringOption(option => option
            .setName('recipe')
            .setDescription('recipe to bake')
            .setRequired(true))
        .addStringOption(option => option
            .setName('input')
            .setDescription('input to work on')
            .setRequired(true)),
    
    async execute(interaction) {
        const recipe = JSON.parse(interaction.options.getString('recipe'));
        const input = interaction.options.getString('input');
        const output = chef.bake(input, recipe);
        return interaction.reply(output.toString());
    },
};
