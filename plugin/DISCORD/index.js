const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookId, webhookToken } = require('./config.json');
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });
const geoip = require('geoip-lite');

const logo = "https://cdn.discordapp.com/attachments/889348842179407926/1109455687764947024/logo.png";

async function CreateLog(plugin, datapoints) {

  if (!webhookId || !webhookToken) return;

  const data = datapoints.suspiciousIPs;
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

  let seed = 0;
  let prediction = "";
  if (datapoints && Array.isArray(datapoints.Seed)) {
    for(let obj of datapoints.Seed) {
      if (Array.isArray(obj.seed)) {
        seed += obj.seed.reduce((acc, number) => acc + number, 0);
      }
      if (obj.prediction) {
        prediction += obj.prediction;
      }
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0xFFFF00)
    .setAuthor({ name: 'LogShield', iconURL: logo})
    .setTitle('**Plugin Evaluation Result:**')
    .setDescription(`Automated system protection checks for plugin: **${plugin}**`)
    .addFields(
      { name: 'Top 5 Countries of Origin:', value: generateTopCountriesDescription(topCountries), inline: false },
      { name: 'Potential Malicious Activities:', value: data.length > 0 ? '```' + data.join(', ') + '```' : 'No potential malicious activities detected', inline: false },
      { name: `Model Stats`, value: `Prediction: ${prediction} \nSeed: ${seed}`, inline: false }
    )
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
    description += `**${index + 1}. ${countryCity}:** ${count} suspicious IP(s)\n`;
  });
  return description;
}

module.exports = { CreateLog };
