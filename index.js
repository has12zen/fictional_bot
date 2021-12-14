const { Client } = require("discord.js");
if (process.env.NODE_ENV !== "production") {
  const { config } = require("dotenv");
  config({ path: __dirname + "/.env" });
}
const { gClient, gClientAuthorize } = require("./google/gClient");
const { gsrun } = require("./google/gsRun");
const botCommands = require("./commands/botCommands");
const util = require("./utility");
const emojiUnicode = require("emoji-unicode");
const reactChannelId = ""; //Replace this with the channel for which you want react roles
const verifChannelsId = ""; // replace this with the channel id of #verif
const emojiBound = require("./data/emojiBound.json");
const messages = require("./data/messages.json");

// Google Authorize + Load Data
gClientAuthorize(gClient);
(async () => {
  data = await gsrun(gClient);
})();

// Discord Client
const client = new Client({
  disableEveryone: true,
});

// Discord Connect
client.on("ready", async () => {
  console.log(`${client.user.username} ONLINE!`);
  client.user.setActivity("Fight Club", { type: "WATCHING" });
  // const channel = client.channels.cache.get(reactChannelId);
  // await message.edit((content = messages.Participation));
  // await channel.send(messages.remaining);
});

// Bot Listeners
client.on("message", async (message) => {
  if (!message.content.startsWith("!")) return;

  const fullMessage = message.content.slice(1);
  const args = fullMessage.split(" ");
  const command = args.shift().toLowerCase();

  console.log(`${command} from ${message.author.username}`);

  if (command === "refresh")
    botCommands.refresh(gClient, message).then((newData) => {
      data = newData;
    });
  else if (
    (command === "verif" || command === "verify") &&
    message.channel.id === verifChannelsId
  ) {
    botCommands.refresh(gClient, message).then((newData) => {
      data = newData;
    }); // simple work around but not clean
    botCommands.verifyMember(message, data, args);
  } else if (command === "addRole")
    message.member.reply("Nothing here check back later");
  else if (command === "assign") botCommands.assignRole(message, args);
  else if (command === "18EE") botCommands.ee18(message);
  else if (command === "sendMessage" && message.author.username === "a_crush") {
    botCommands.sendMessage(client, message);
  } else if (command === "sendRoles" && message.author.username === "a_crush") {
    const channel = await client.channels.cache.get(reactChannelId);
    botCommands.sendRoles(channel);
  } else if (command === "SendGMEMessage") {
    const channel = await client.channels.cache.get(reactChannelId);
    botCommands.sendGMEMessage(channel);
  } else if (command === "poll") {
    if (args.length == 0) return;

    botCommands.handlePoll(fullMessage, message);
  } else {
    botCommands.wrongCommand(message);
  }
});

client.on("raw", async (packet) => {
  // We don't want this to run on unrelated packets
  try {
    if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t))
      return;

    if (packet.d.user_id === client.user.id) return;

    const channel = await client.channels.fetch(packet.d.channel_id);
    const message = await channel.messages.fetch(packet.d.message_id);

    if (
      message.author.bot &&
      message.author.id === client.user.id &&
      message.content === "" &&
      message.embeds.length === 1 &&
      message.embeds[0].title === "Poll" &&
      packet.t === "MESSAGE_REACTION_ADD"
    ) {
      if (message.embeds[0].fields.length == 1) {
        const reactions = message.reactions.cache;
        const optionsCount = message.embeds[0].fields[0].name.split(" ")[0];

        const letters = [
          "🇦",
          "🇧",
          "🇨",
          "🇩",
          "🇪",
          "🇫",
          "🇬",
          "🇭",
          "🇮",
          "🇯",
          "🇰",
          "🇱",
          "🇲",
          "🇳",
          "🇴",
          "🇵",
          "🇶",
          "🇷",
          "🇸",
          "🇹",
          "🇺",
          "🇻",
          "🇼",
          "🇽",
          "🇾",
          "🇿",
        ];

        if (!letters.slice(0, optionsCount).includes(packet.d.emoji.name)) {
          const rxn = message.reactions.resolve(packet.d.emoji.name);
          if (rxn) rxn.remove();
        } else {
          reactions.forEach((rxn) => {
            if (rxn._emoji.name != packet.d.emoji.name) {
              rxn.users.remove(packet.d.user_id);
            }
          });
        }
      } else {
        const reactions = message.reactions.cache;

        if (packet.d.emoji.name === "👍" || packet.d.emoji.name === "👎")
          reactions.forEach((rxn) => {
            if (rxn._emoji.name != packet.d.emoji.name) {
              rxn.users.remove(packet.d.user_id);
            }
          });
        else
          reactions.forEach((rxn) => {
            if (rxn._emoji.name != "👍" && rxn._emoji.name != "👎") {
              rxn.remove();
            }
          });
      }
    }

    // Grab the channel to check the message from
    if (packet.d.channel_id !== reactChannelId) return;
    // console.log(packet.d);
    console.log("em");

    if (message) {
      let messagelocation = emojiBound[packet.d.message_id];
      const emoji = packet.d.emoji.name;
      console.log(messagelocation, emoji);
      let emojilocation = "";
      switch (messagelocation) {
        case "SEC":
          emojilocation = emojiBound.SEC;
          break;
        case "Other":
          emojilocation = emojiBound.Other;
          break;
        case "Fests":
          emojilocation = emojiBound.Fests;
          break;
        case "Sports":
          emojilocation = emojiBound.Sports;
          break;
        case "Skills":
          emojilocation = emojiBound.Skills;
          break;
        case "Tech":
          emojilocation = emojiBound.Tech;
          break;
        case "THI":
          emojilocation = emojiBound.THI;
          break;
        case "PARTICIPATION":
          emojilocation = emojiBound.PARTICIPATION;
          break;
        case "ACH":
          emojilocation = emojiBound.ACH;
          break;
        case "HOS":
          emojilocation = emojiBound.HOS;
          break;
        case "GME":
          emojilocation = emojiBound.GME;
          break;
        default:
          return;
      }
      let role = emojilocation[emoji];
      // console.log(emojilocation, emoji);
      if (!message.content.includes(role)) return;
      let user = await client.users.fetch(packet.d.user_id);
      // Adds the currently reacting user to the reaction's users collection.
      // Check which type of event it is before emitting
      if (packet.t === "MESSAGE_REACTION_ADD") {
        // console.log('AD1');
        util.handleReaction(role, user, message, true);
      }
      if (packet.t === "MESSAGE_REACTION_REMOVE") {
        // console.log('RM1');
        util.handleReaction(role, user, message, false);
      }
    }
  } catch (err) {
    console.error(err);
  }
});
// Discord Client Login
client.login(process.env.TOKEN);
