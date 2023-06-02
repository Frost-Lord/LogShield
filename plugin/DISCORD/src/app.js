const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const options = require("../config.json");

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
  require(`./handlers/${file}`)(client);
});

client.login(token).catch((err) => {
  console.warn(
    "[CRASH] Something went wrong while connecting to your bot..." + "\n"
  );
  console.warn("[CRASH] Error from Discord API:" + err);
  process.exit();
});

const token = options.token;
