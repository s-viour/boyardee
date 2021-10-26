const { SlashCommandBuilder } = require('@discordjs/builders');
const chef = require('cyberchef');
const { MessageAttachment } = require('discord.js');

const fixOperationStrings = (s) => {
  if (typeof s === 'string') {
    console.log('s is a string');
    return s.replace('/', '');
  }

  return s.map((elem) => {
    const newElem = elem;
    newElem.op = newElem.op.replace('/', '');
    return newElem;
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bake')
    .setDescription('takes a recipe and an input string and processes it with cyberchef')
    .addStringOption((option) => option
      .setName('recipe')
      .setDescription('recipe to bake')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('input')
      .setDescription('input to work on')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('saveas')
      .setDescription('specify a name to save the recipe')
      .setRequired(false)),

  async execute(interaction) {
    // first, attempt to parse the recipe as a valid JSON formatted recipe
    let parsedRecipe;
    try {
      parsedRecipe = JSON.parse(interaction.options.getString('recipe'));
    } catch (e) {
      // and if that fails, just take it as the string
      if (e instanceof SyntaxError) {
        parsedRecipe = interaction.options.getString('recipe');
      } else {
        // if something else happened though, rethrow
        throw e;
      }
    }
    const recipe = fixOperationStrings(parsedRecipe);

    // Check that the saveas name is valid before doing any baking
    let toSave = interaction.options.getString('saveas');
    if (toSave) {
      // Strip non-alphanumeric characters from the name
      toSave = toSave.replace(/\W/g, '');
      if (toSave.length === 0) {
        return interaction.reply({ content: 'Recipe name must contain at least one alphanumeric character', ephemeral: true });
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
        return interaction.reply({ content: `invalid recipe: ${e.message}`, ephemeral: true });
      } if (e instanceof chef.ExcludedOperationError) {
        // explicitly handle the unsupported operation error with a special message
        return interaction.reply({ content: `unsupported operation: ${e.message}`, ephemeral: true });
      }
      throw e;
    } finally {
      console.dir(output);
    }

    let reply = { content: "", files: [] };

    if (output.size > 2000) {
      console.log('sending message with attachment');
      reply.content = 'Output: \n';
      const bytes = Buffer.from(output.get('array buffer'));
      console.log(`bytes: ${bytes}`);
      const opts = {
        attachment: bytes,
        name: 'output'
      };
      reply.files.push(opts);
    } else {
      reply.content = output.toString();
    }

    if (toSave) {
      const db = require('..');
      db.set(toSave, recipe);
      reply.content += `\n\nSaved recipe \`\`\`${JSON.stringify(recipe)}\`\`\` as ${toSave}`;
    }

    return interaction.reply(reply);
  },
};
