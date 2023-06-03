const client = global.client;
const { ActivityType } = require('discord.js');

module.exports = {
  name: "ready"
};

client.on('ready', async (client) => {
  console.log(`Bot (${client.user.username}) is Online!`);
  client.user.setPresence({
    activities: [{ name: `LogShield | Shard: 1 `, type: ActivityType.Watching }]
  });

  //REGISTER SLASH COMMANDS
  require("../../slashRegister.js").run(client);
})