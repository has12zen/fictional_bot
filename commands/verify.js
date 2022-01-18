const messages = require("../data/messages.json");
const roleIDs = require("../data/roleID.json");

exports.verifyMember = async (message, data, args) => {
  try {
    const { yy, bb, rollNumber, secretKey, program } = parseArgs(args);
    await message.author.send(
      messages.yohooman + `\n${rollNumber} ${secretKey}`
    );
    // console.log(data);
    let member = await message.guild.members.fetch(message.author.id);
    verifyRunning(
      member,
      rollNumber,
      yy,
      bb,
      program,
      secretKey,
      data.data,
      message
    );
  } catch (err) {
    console.log("Verification Error:>", err);
    message.author.send(messages.err);
  } finally {
    message
      .delete({ timeout: 5000 })
      .then((message) =>
        console.log(
          `Deleted message from ${message.author.username} after 5 seconds`
        )
      )
      .catch((err) => console.error(err));
  }
};

const verifyRunning = (
  member,
  rollNumber,
  yy,
  bb,
  program,
  secretKey,
  data,
  message
) => {
  const { found, dataKey, nickname } = loopfind(data, rollNumber);
  try {
    if (found && dataKey === secretKey) {
      assignRunning(member, rollNumber, yy, bb, program);
      setUserNickname(member, nickname);
      member.roles.add(roleIDs.member);
      member.roles.remove(roleIDs.res_member);
      message.author.send(messages.verifSuccess);
    } else if (found && dataKey !== secretKey) {
      message.author.send(messages.verifFail);
    } else if (!found) {
      message.author.send(messages.verifFail);
    }
  } catch (err) {
    console.log("error in verifyRunning:>", err);
    throw new Error(err);
  }
};

const verifyAlumni = (message, data, args) => {};

const loopfind = (data, rollNumber) => {
  try {
    let found = false;
    let dataKey = "";
    let nickname = "";
    const n = data.values.length;
    for (i = Math.abs(Math.floor(n / 2)); i < n; i++) {
      // lazy code
      if (i < 0) break;
      if (data.values[i][3].trim().toUpperCase() == rollNumber) {
        console.log("found");
        found = true;
        dataKey = data.values[i][4]; // select last occurrence of roll number
        nickname = data.values[i][2];
        break;
      }
    }
    dataKey = dataKey.trim();
    return { found, dataKey, nickname };
  } catch (err) {
    console.log("error in loopfind", err);
    return { found: false, dataKey: "", nickname: "" };
  }
};

const parseArgs = (args) => {
  // yybb
  let rollNumber = args[0] == undefined ? "" : args[0];
  rollNumber = rollNumber.toUpperCase();
  let secretKey = args[1] == undefined ? "" : args[1];
  let yy = rollNumber[0] + rollNumber[1];
  let bb = rollNumber[2] + rollNumber[3];
  yy = parseInt(yy);
  const program = rollNumber[5];
  return { rollNumber, secretKey, yy, bb, program };
};

const assignRunning = (member, rollNumber, yy, bb, program) => {
  try {
    if (program == 1 || program == 2) {
      member.roles.add(roleIDs[bb], roleIDs[yy], roleIDs[yy + bb]);
      if (yy < 18) member.roles.add(roleIDs.alumni);
    } else if (program == 5) {
      if (yy == 19) member.roles.add(roleIDs["msc19"]);
      if (yy == 20) member.roles.add(roleIDs["msc20"]);
      member.roles.add(roleIDs[bb],roleIDs[yy]);
    } else if (program == 6) {
      if (yy == 19) member.roles.add(roleIDs["mt19"]);
      if (yy == 20) member.roles.add(roleIDs["mt20"]);
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
  } catch (err) {
    console.log("error ins assigning running role:>", err);
    throw new Error(err);
  }
};

const setUserNickname = (member, nickname) => {
  try {
    member.setNickname(nickname);
    if (nickname != "") {
      message.member.setNickname(nickname);
      console.log("nickname changed");
    }
  } catch (e) {
    console.log("could not update nickname:>", e);
    // throw new Error(e);
  }
};

const assingAlumni = (member, rollNumber, yy, bb, program) => {
  member.roles.add(roleIDs.alumni);
  member.roles.add(roleIDs[yy]);
  member.roles.add(roleIDs[bb]);
};
