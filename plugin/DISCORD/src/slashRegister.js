let run = (client) => {
  const { token } = require("../config.json");

  const fs = require("fs");
  const { REST } = require("@discordjs/rest");
  const { Routes } = require("discord.js");
  const commands = [];

  Commands("./plugin/DISCORD/src/slash");

  function Commands(Files) {
    for (const file of fs.readdirSync(Files, { withFileTypes: true })) {
      if (file.name.endsWith(".js")) {
        let ruta = `${Files}/${file.name}`.replace("./src", ".");
        const command = require(ruta);
        commands.push(command.data.toJSON());
        client.slash.set(command.data.name, command);
      } else if (file.isDirectory()) {
        Commands(`${Files}/${file.name}`);
      }
    }
  }

  const rest = new REST({ version: "10" }).setToken(token);
  rest
    .put(Routes.applicationCommands(client.user.id), { body: commands })
    .then(() => console.log("Successfully reloaded application (/) commands."))
    .catch(console.error);
};

module.exports = { run };
