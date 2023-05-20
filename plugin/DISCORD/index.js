const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookId, webhookToken } = require('./config.json');
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

const logo = "https://cdn.discordapp.com/attachments/889348842179407926/1109455687764947024/logo.png";

async function CreateLog(plugin, data) {
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('**Plugin Evaluation Result:**')
        .setDescription(`Automated system protection checks \n\n **Plugin:** \n ${plugin}`)
        .addFields([
            {
                name: '**Potential Malicious Activities**', value: `
            \`\`\`
            ${await data.join(', ')}
            \`\`\`
          `, inline: true
            }
        ])
        .setFooter({ text: 'LogShield', iconURL: logo })
        .setTimestamp();

    await webhookClient.send({
        username: 'LogShield',
        avatarURL: logo,
        embeds: [embed],
    });
}

module.exports = { CreateLog };