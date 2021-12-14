const { MessageEmbed } = require("discord.js");
const { gsrun } = require("../google/gsRun");
const messages = require("../data/messages.json");
const roleIDs = require("../data/roleID.json");

exports.refresh = async (gClient, message) => {
  console.log("Refresh Command...");
  message.reply(messages.refresh);
  return await gsrun(gClient);
};

exports.verifyMember = async (message, data, args) => {
  // console.log(message);
  try {
    await message.author.send(messages.yohooman);
    let rollNumber = args[0] == undefined ? "" : args[0];
    let secretKey = args[1] == undefined ? "" : args[1];
    let dataKey = "";
    let nickname = "";
    let member = await message.guild.members.fetch(message.author.id);
    const n = data.data.values.length;
    console.log("verify qrgs", args, secretKey, rollNumber, n);
    rollNumber = rollNumber.toUpperCase();
    let found = false;
    for (i = Math.abs(Math.floor(n / 2)); i < n; i++) {
      // lazy code
      if (i < 0) break;
      if (data.data.values[i][3].trim().toUpperCase() == rollNumber) {
        console.log("found");
        found = true;
        dataKey = data.data.values[i][4]; // select last occurrence of roll number
        nickname = data.data.values[i][2];
        break;
      }
    }
    if (!found) {
      message.author.send(messages.verifFail);
    } else {
      if (dataKey.trim() == secretKey) {
        console.log("matched");
        let yy = rollNumber[0] + rollNumber[1];
        let bb = rollNumber[2] + rollNumber[3];
        if (rollNumber[5] == 1 || rollNumber[5] == 2) {
          member.roles.add(roleIDs[yy]);
          member.roles.add(roleIDs[bb]);
          member.roles.add(roleIDs[yy + bb]);
        } else if (rollNumber[5] == 5) {
          if (yy == "19") member.roles.add(roleIDs["msc19"]);
          if (yy == "20") member.roles.add(roleIDs["msc20"]);
          member.roles.add(roleIDs[bb]);
        } else if (rollNumber[5] == 6) {
          if (yy == "19") member.roles.add(roleIDs["mt19"]);
          if (yy == "20") member.roles.add(roleIDs["mt20"]);
          if (bb == "CL") member.roles.add(roleIDs["mtseocs"]);
          else if (bb == "CS" || bb == "EC" || bb == "PD" || bb == "PS")
            member.roles.add(roleIDs["mtses"]);
          else if (
            bb == "SE" ||
            bb == "TE" ||
            bb == "EV" ||
            bb == "WR" ||
            bb == "GT"
          )
            member.roles.add(roleIDs["mtsif"]);
          else if (bb == "SD" || bb == "TS" || bb == "MF")
            member.roles.add(roleIDs["mtsms"]);
          else if (bb == "MM") member.roles.add(roleIDs["mtsmmme"]);
          // message.member.roles.add(roleIDs[bb]);
        }
        console.log("roles added");
        member.roles.add(roleIDs.member);
        if (nickname != "") {
          message.member
            .setNickname(nickname)
            .catch((e) => console.log("could not update nickname"));
          console.log("nickname changed");
        }
        message.author.send(messages.verifSuccess);
        member.roles.remove(roleIDs.res_member);
        console.log("restriction removed changed");
      } else message.author.send(messages.keyMismatch);
    }
    message
      .delete({ timeout: 5000 })
      .then((message) =>
        console.log(
          `Deleted message from ${message.author.username} after 5 seconds`
        )
      )
      .catch((err) => console.error(err));
  } catch (err) {
    console.log(err);
    message.author.send(messages.err);
  }
};

exports.assignRole = (message, args) => {
  let roleG = args[0];
  let year = parseInt("" + roleG[0] + roleG[1]);
  let branch = "" + roleG[2] + roleG[3];
  try {
    message.member.roles.add(roleIDs[year]);
    message.member.roles.add(roleIDs[branch]);
    message.member.send("You've been assigned new roles.");
  } catch (err) {
    console.log(err);
    message.member.send("Failed! Please check the syntax.");
  }
};

exports.ee18 = (message) => {
  try {
    message.member.roles.add(roleIDs["18EE"]);
    message.member.send("You can now see the emft chat.");
  } catch (err) {
    console.log(err);
    message.member.send("Failed! Please check the syntax.");
  }
};

exports.sendGMEMessage = async (channel) => {
  try {
    await channel.send(messages.Games);
    // message.member.send('Success!');
  } catch (err) {
    console.log(err);
    // message.member.send('Failed!');
  }
};

exports.wrongCommand = async (message) => {
  try {
    message.author.send(messages.wrongCommand);
    // message.member.send('Success!');
  } catch (err) {
    console.log(err);
    // message.member.send('Failed!');
  }
};

exports.sendMessage = (client, message) => {
  try {
    let channel_id = "";
    let i = 0;
    while (message.content[i] != " ") ++i;
    ++i;
    while (message.content[i] != " ") {
      channel_id += message.content[i];
      ++i;
    }
    ++i;
    let new_content = message.content.slice(i, message.content.length);
    const channel = client.channels.cache.get(channel_id);
    channel.send(new_content);
    message.member.send("Sent:\n" + new_content);
  } catch (err) {
    console.log(err);
    message.member.send("Failed!");
  }
};

exports.sendRoles = async (channel) => {
  try {
    await channel.send(messages.Roles);
    await channel.send(messages.Technical);
    await channel.send(messages.SecondYearInternship);
    await channel.send(messages.ThirdYearInternship);
    await channel.send(messages.Participation);
    await channel.send(messages.CoAcademicAchievements);
    await channel.send(messages.CollegeOrganizations);
    await channel.send(messages.SocioCultural);
    await channel.send(messages.Sports);
    await channel.send(messages.Fests);
    await channel.send(messages.Games);
    await channel.send(messages.Others);
    // message.member.send('Success!');
  } catch (err) {
    console.log(err);
    // message.member.send('Failed!');
  }
};

const isValidSyntax = (cmnd) => {
  const template = /^{([^}]*)\}((\s)*\[([^\]]*)\])*$/;
  const valid = template.test(cmnd);
  // console.log(valid);
  // if (valid) console.log(cmnd.match(template));

  return valid;
};

exports.handlePoll = async (command, msg) => {
  const truncMessage = command.replace("poll", "").trim();
  if (truncMessage === "help") {
    // msg.reply(
    //   "For syntax  \t- `!poll help`\nYes/No poll   - `!poll {msg}`\nWith options - `!poll {msg}[opt1][opt2]...[optk]`"
    // );

    const help = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Poll command syntax")
      .addFields(
        { name: "Help", value: "`!poll help`" },
        { name: "Yes/No poll", value: "`!poll {msg}`" },
        {
          name: "Poll with options",
          value: "`!poll {msg}[opt1][opt2]...[optk]`",
        }
      );

    msg.channel.send({ embed: help });

    return;
  }

  if (!isValidSyntax(truncMessage)) {
    msg.author.send(messages.wrongPollCommand);

    return;
  }

  const matchPollMsg = /\{([^}]*)\}/g;
  const matchPollOptions = /(\s)*\[([^\]]*)\]/g;

  const pollMessage = truncMessage.match(matchPollMsg)[0];
  const optionsMessage = truncMessage.replace(pollMessage, "");
  const pollOptions = optionsMessage.match(matchPollOptions);

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

  let pollDescription = pollMessage.slice(1, -1).trim() + "\n";
  let numOptions = 0;
  let pollDescriptionOptions = "";

  if (pollOptions)
    pollOptions.forEach((el) => {
      const option = el.trim().slice(1, -1).trim();
      if (option !== "") {
        pollDescriptionOptions += `\n${letters[numOptions]}\t${option}`;
        ++numOptions;
      }
    });

  const poll = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Poll")
    .setDescription(pollDescription);

  if (pollDescriptionOptions !== "")
    poll.addFields({
      name: `${numOptions} Option${numOptions == 1 ? "" : "s"}`,
      value: pollDescriptionOptions,
    });

  msg.channel.send({ embed: poll }).then((reaction) => {
    if (numOptions > 0)
      for (let i = 0; i < numOptions; i++)
        reaction.react(letters[i]).catch(console.error);
    else {
      reaction.react("👍").catch(console.error);
      reaction.react("👎").catch(console.error);
    }
  });
};

// 5 for M.SC
// 6 For M.Tech

// XX Means, Branch name
// Details: -
// 1) FOR ENGINEERING
// ✓ CL....Climate science and technology
// ✓ CS....Computer Science and Engineering
// ✓ EC....Electronic and Communication Engineering
// ✓ EV.....Environmental Engineering
// ✓ GT....Geotechnical Engineering
// ✓ MF....Manufacturer Engineering
// ✓ SD....Mechanical System Design
// ✓ MM..Metallurgical and Materials Engineering
// ✓ PD....Power Electronics and Drives
// ✓ PS....Power Systems Engineering
// ✓ SE....Structural Engineering
// ✓ TS...Thermal Science and Engineering
// ✓ TE...Transportation Engineering
// ✓ WR...Water Resources Engineering

// 2) MSC
// ✓ CL....Atmospheric and Ocean Sciences
// ✓ CY....Chemistry
// ✓ GG...Geology
// ✓ MA...Mathematics
// ✓ PH....Physics
