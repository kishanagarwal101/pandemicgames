const wxyzModel = require("../../../Models/wxyzModel");
const disconnectWxyz = async (username, roomID, socket, io) => {
  const room = await wxyzModel.findOne({ roomID });
  if (room) {
    const newUserList = room.users.filter((user) => user.username !== username);
    let hasAdmin = false;
    newUserList.forEach((user) => {
      if (user.isAdmin) {
        hasAdmin = true;
      }
    });
    //Make New Admin
    if (!hasAdmin) {
      newUserList[0].isAdmin = true;
      io.in(roomID).emit("changeWxyzAdmin", {
        adminUsername: newUserList[0].username,
        leftUsername: username,
      });
      await wxyzModel.findOneAndUpdate(
        { roomID },
        { users: newUserList, adminUsername: newUserList[0].username }
      );
    } else {
      console.log(roomID);
      io.in(roomID).emit("changeWxyzAdmin", {
        adminUsername: username,
        leftUsername: username,
      });
      await wxyzModel.findOneAndUpdate({ roomID }, { users: newUserList });
    }
  }
};
module.exports = disconnectWxyz;
