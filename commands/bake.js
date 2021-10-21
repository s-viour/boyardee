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
            .setRequired(true))
        .addStringOption(option => option
            .setName('saveas')
            .setDescription('specify a name to save the recipe')
            .setRequired(false)),
    
    async execute(interaction) {
        // first, attempt to parse the recipe as a valid JSON formatted recipe
        let recipe;
        try {
            recipe = JSON.parse(interaction.options.getString('recipe'));
        } catch (e) {
            // and if that fails, just take it as the string
            if (e instanceof SyntaxError) {
                recipe = interaction.options.getString('recipe');
            } else {
                // if something else happened though, rethrow
                throw e;
            }
        }

        // Check that the saveas name is valid before doing any baking
        let to_save = interaction.options.getString('saveas')
        if (to_save) {
            // Strip non-alphanumeric characters from the name
            to_save = to_save.replace(/\W/g, '');
            if (to_save.length == 0) {
                return interaction.reply({content: "Recipe name must contain at least one alphanumeric character", ephemeral: true})
            }
        }

        const input = interaction.options.getString('input');

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

        let reply = output.toString()
        if (to_save) {
            const db = require('..');
            db.set(to_save, recipe)
            reply += `\n\nSaved recipe \`\`\`${JSON.stringify(recipe)}\`\`\` as ${to_save}`
        }

        return interaction.reply(reply);
    },
};
