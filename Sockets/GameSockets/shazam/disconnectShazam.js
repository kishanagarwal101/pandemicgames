const shazamModel = require("../../../Models/shazamModel");
const roomModel = require("../../../Models/roomModel");
const disconnectShazam = async (username, roomID, socket, io) => {
    const room = await shazamModel.findOne({ roomID })
    if (room) {

        const newUserList = room.users.filter(user => user.username !== username);
        if (username === room.adminUsername) {
            let hasAdmin = false;
            newUserList.forEach(user => {
                if (user.isAdmin) {
                    hasAdmin = true;
                }
            });
            //Make New Admin
            if (!hasAdmin) {
                newUserList[0].isAdmin = true;
                io.in(roomID).emit('changeShazamAdmin', { adminUsername: newUserList[0].username })
                await shazamModel.findOneAndUpdate({ roomID }, { users: newUserList, adminUsername: newUserList[0].username });
            }
            else {
                io.in(roomID).emit('changeShazamAdmin', { adminUsername: username })
                await shazamModel.findOneAndUpdate({ roomID }, { users: newUserList });
            }

        }
    }
}
module.exports = disconnectShazam;