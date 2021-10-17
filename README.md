boyardee is a discord bot for evaluating [cyberchef](https://github.com/gchq/CyberChef) recipes from within discord. it uses cyberchef's Node API, so some operations are unsupported (see [excluded operations](https://github.com/gchq/CyberChef/wiki/Node-API#excluded-operations)).

# setup
boyardee uses slash commands and discord.js v13, so it **requires Nodejs v16.6.0 or higher**.

1. create a config file in the project directory called `config.json`. this config file has the format: 
```json
{
    "clientId": "",
    "guildId": "",
    "token": ""
}
```
where all those fields are filled in with the bot's client id, the guild's id to register commands to, and your bot's token.

2. run `npm run deploy-commands` to register the commands in the guild supplied in the config file

3. run `npm start` to start the bot!

# commands
* ping - responds with pong. basic testing command
* bake - takes a recipe in json format, and an input string and replies with the processed input
* more soon (?)
