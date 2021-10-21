const { SlashCommandBuilder } = require('@discordjs/builders');
const chef = require('cyberchef');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rebake')
        .setDescription('takes a saved recipe and an input and bakes it using cyberchef')
        .addStringOption(option => option
            .setName('name')
            .setDescription('name of saved recipe to bake')
            .setRequired(true))
        .addStringOption(option => option
            .setName('input')
            .setDescription('input to work on')
            .setRequired(true)),
    
    async execute(interaction) {
        const name = interaction.options.getString('name');

        const db = require('..');
        let recipe = await db.get(name);
        if (recipe == false) {
            return interaction.reply({content: "Recipe name not found in database", ephemeral: true});
        }
        const input = interaction.options.getString('input');
        console.log(recipe);

        // attempt to generate the output with bake
        let output;
        try {
            output = chef.bake(input, recipe);
        } catch (e) {
            if (e instanceof TypeError) {
                // bake(...) throws a TypeError if the recipe name isn't valid
                return interaction.reply({content: `invalid recipe: ${e.message}`, ephemeral: true});
            } else if (e instanceof chef.ExcludedOperationError) {
                // explicitly handle the unsupported operation error with a special message
                return interaction.reply({content: `unsupported operation: ${e.message}`, ephemeral: true});
            } else {
                throw e;
            }
        }

        return interaction.reply(output.toString());
    },
};
