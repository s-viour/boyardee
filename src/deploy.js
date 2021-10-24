const fs = require('fs');
const { token } = require('../config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


const getCommands = () => {
  const commands = [];
  const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
  }

  return commands;
};
const commands = getCommands();

module.exports = {
  deployCommandsToServer: (clientId, guildId) => {
    const rest = new REST({ version: '9' }).setToken(token);
  
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
      .then(() => console.log(`Successfully registered app commands to guild ${guildId}!`))
      .catch(console.error);
  },
  
  deployCommandsGlobal: (clientId) => {
    const rest = new REST({ version: '9'}).setToken(token);
    
    rest.put(Routes.applicationCommands(clientId), {body: commands})
      .then(() => console.log('Successfully registered app commands globally!'))
  },
};
