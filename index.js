require('dotenv').config()
const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const { token }  = require('./config.json');
const jsoning = require('jsoning')
const db = new jsoning('recipe_db.json')
module.exports = db;


const client = new Client({intents: [Intents.FLAGS.GUILDS]});
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}


client.once('ready', () => {
    console.log('ready!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) { return; }
    
    const command = client.commands.get(interaction.commandName);
    if (!command) { return; }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.log(error);
        await interaction.reply({
            content: 'error executing command',
            ephemeral: true
        });
    }
});

client.login(token)