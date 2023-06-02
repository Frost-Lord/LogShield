const {
  InteractionType,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",
};

client.on("interactionCreate", async (interaction) => {
  interaction.commands = client.commands;

  if (!interaction.type === InteractionType.ApplicationCommand) return;
  
  const command = client.slash.get(interaction.commandName);
  if (!command) return;
  if (command.botpermissions) {
    let missingperms = [];

    command.botpermissions.forEach((permission) => {
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionsBitField.resolve(permission)
        )
      ) {
        missingperms.push(permission);
      } else {
        return;
      }
    });

    if (missingperms.length > 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `🚫 Unfortunately, I can't run this command. I need the following permissions: \n \`${missingperms.join(
            ", "
          )}\``
        )
        .setColor("Red");
      return interaction.reply({ embeds: [embed] });
    }
  }

  if (command.permissions) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.resolve(command.permissions || [])
      )
    )
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `🚫 Unfortunately, you can't run this command. You need the following permissions: \n \`${command.permissions}\``
            )
            .setColor("Red"),
        ],
      });
  }
  try {
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.resolve("SendMessages")
      )
    )
      return;
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.resolve("EmbedLinks")
      )
    ) {
      return interaction.reply({
        content:
          "Dear human, I lack some permissions! I need the `Embed Links` permission to run this command!",
      });
    }

    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    return interaction
      .reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `🚫 An error has occurred while executing this command | **/${command.name}** \n\n Please report this error to the developer of this bot.`
            ),
        ],
      })
      .catch((err) => {});
  }
});
