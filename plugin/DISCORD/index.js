const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookId, webhookToken } = require('./config.json');
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });
const geoip = require('geoip-lite');

const logo = "https://cdn.discordapp.com/attachments/889348842179407926/1109455687764947024/logo.png";

async function CreateLog(plugin, data) {
  let locations = data.map((ip) => {
    const geo = geoip.lookup(ip);
    if (geo) {
      return geo;
    }
    return null;
  });

  const countryCounts = locations.reduce((counts, location) => {
    if (location) {
      const city = location.city;
      const key = `${city || location.country}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, {});

  const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
  const topCountries = sortedCountries.slice(0, 5);

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('**Plugin Evaluation Result:**')
    .setDescription(`Automated system protection checks\n\n**Plugin:** ${plugin} \n\n **Top 5 Countries:** \n ${generateTopCountriesDescription(topCountries)}`)
    .addFields(
      { name: 'Potential Malicious Activities', value: '```' + data.join(', ') + '```', inline: true }
    )
    .setFooter({ text: 'LogShield', iconURL: logo })
    .setTimestamp();

  await webhookClient.send({
    username: 'LogShield',
    avatarURL: logo,
    embeds: [embed],
  });
}

function generateTopCountriesDescription(topCountries) {
  let description = '';
  topCountries.forEach(([countryCity, count], index) => {
    description += `**${index + 1}. ${countryCity}** ${count} IP(s)\n`;
  });
  return description;
}

module.exports = { CreateLog };
