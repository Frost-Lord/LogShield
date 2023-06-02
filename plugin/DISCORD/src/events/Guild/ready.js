const client = global.client;
const { ActivityType } = require('discord.js');

module.exports = {
  name: "ready"
};

client.on('ready', async (client) => {
  console.log(
    "//////////////////////////////////////////////////////////////////////////////////////////////////"
  );
  console.log("0------------------| Shard Handler: \n");
  console.log(`Bot (${client.user.username}) is Online!`);
  console.log(
    "//////////////////////////////////////////////////////////////////////////////////////////////////"
  );

  client.user.setPresence({
    activities: [{ name: `LogShield | Shard: 1 `, type: ActivityType.Watching }]
  });

  //REGISTER SLASH COMMANDS
  require("../../slashRegister.js").run(client);
})