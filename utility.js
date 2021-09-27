const roleBound = require("./data/roleID.json");

exports.handleReaction = async (emojiBound, user, message, add) => {
  if (user.id === "bot_id") return;
  console.log("FUnc 2");
  //check if emoji is valid
  let member = await message.guild.members.fetch(user.id);
  // console.log(roleBound[emojiBound]);
  try {
    if (add) member.roles.add(roleBound[emojiBound]);
    else member.roles.remove(roleBound[emojiBound]);
  } catch (err) {
    console.log(err);
  }
};
