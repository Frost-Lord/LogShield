const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  WebhookClient,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder
} = require("discord.js");
const options = require("./config.json");
const geoip = require('geoip-lite');

const client = (global.client = new Client({
  partials: [
    Partials.Message,
    Partials.GuildPresences,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
    Partials.MessageReaction,
    Partials.Invite,
    Partials.Webhook,
    Partials.Emoji,
    Partials.Guild,
    Partials.GuildChannel,
    Partials.GuildEmoji,
    Partials.GuildMember,
    Partials.GuildMemberRole,
    Partials.GuildMessage,
    Partials.GuildMessageReaction,
    Partials.GuildRole,
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
}));

client.events = new Collection();
client.slash = new Collection();

/////////////////////////////////////////////////////////////////////////////////////
//events
["events"].forEach((file) => {
  require(`./src/handlers/${file}`)(client);
});

client.login(options.token).catch((err) => {
  console.warn(
    "[CRASH] Something went wrong while connecting to your bot..." + "\n"
  );
  console.warn("[CRASH] Error from Discord API:" + err);
  process.exit();
});


/////////////////////////////////////////////////////////////////////////////////////
async function CreateLog(plugin, datapoints) {

  const channel = client.channels.cache.get(options.logChannel);
  if (!channel) return console.warn(`[LOG] ${plugin} channel ID not found!`);

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
    for (let obj of datapoints.Seed) {
      if (Array.isArray(obj.seed)) {
        seed += obj.seed.reduce((acc, number) => acc + number, 0);
      }
      if (obj.prediction) {
        prediction += obj.prediction;
      }
    }
  }

  const row1 = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId(`BanAllIPs`)
      .setLabel('Ban All IPs')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('💣')
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(`BanCustomIPs`)
      .setLabel('Ban Custom IPs')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🛠️')
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(`BanCountry`)
      .setLabel('Ban Country')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🏙️')
  );

const row2 = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId(`UnbanIPs`)
      .setLabel('Unban IPs')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🔓')
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(`UnbanCountry`)
      .setLabel('Unban Country')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🔓')
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(`Re-evaluate`)
      .setLabel('Re-evaluate')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🔄')
  );

  const pluginNormalized = plugin.toLowerCase().charAt(0).toUpperCase() + plugin.toLowerCase().slice(1);

  const embed = new EmbedBuilder()
    .setColor(0xFFFF00)
    .setTitle('**Plugin Evaluation Result:**')
    .setDescription(`**Automated system protection checks for plugin:** ${pluginNormalized}`)
    .addFields(
      { name: 'Top 5 Countries of Origin:', value: generateTopCountriesDescription(topCountries), inline: false },
      { name: 'Potential Malicious Activities:', value: generateDataValue(data), inline: false },
    )
    .setFooter({ text: "Prediction: " + prediction + " | Seed: " + seed + " | Plugin: " + pluginNormalized + " | " + new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " EST | " + data.length + " suspicious IP(s)" })
    .setTimestamp();

    await channel.send({ embeds: [embed], components: [row1, row2] }).then(async () => {
      console.log(`[LOG] ${plugin} log created!`);
    }).catch((err) => {
      console.warn(`[LOG] ${plugin} log failed to create!`);
      console.warn(`[LOG] Error from Discord API: ${err}`);
    });
}

function generateTopCountriesDescription(topCountries) {
  let description = '';
  topCountries.forEach(([countryCity, count], index) => {
    description += `**${index + 1}. ${countryCity}:** ${count} suspicious IP(s)\n`;
  });
  return description;
}

function generateDataValue(data) {
  if (data.length > 0) {
    if (data.length > 15) {
      const remainingCount = data.length - 15;
      return '```' + data.slice(0, 15).join(', ') + ` + ${remainingCount} more` + '```';
    } else {
      return '```' + data.join(', ') + '```';
    }
  } else {
    return 'No potential malicious activities detected';
  }
}

module.exports = { CreateLog };