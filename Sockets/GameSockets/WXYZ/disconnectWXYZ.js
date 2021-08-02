const wxyzModel = require("../../../Models/wxyzModel");
const roomModel = require("../../../Models/roomModel");
const disconnectWXYZ = async (username, roomID, socket) => {
    const room = await wxyzModel.findOne({ roomID })
    if (room) {
        if (room.adminUsername === username) {
            const newAdmin = room.users[0].username === username ? room.users[1].username : room.users[0].username;
            await wxyzModel.deleteOne({ roomID: roomID });
            const payload = {
                roomID: roomID,
                users: [],
                roomName: room.roomName,
                adminUsername: newAdmin,
                selectedGame: -1
            }
            const newLobby = new roomModel(payload);
            await newLobby.save();
            socket.to(roomID).emit('returnToRoomFromWXYZ', { admin: true });
        }
        else {
            await wxyzModel.deleteOne({ roomID: roomID });
            const payload = {
                roomID: roomID,
                users: [],
                roomName: room.roomName,
                adminUsername: username,
                selectedGame: -1
            }
            const newLobby = new roomModel(payload);
            await newLobby.save();
            socket.to(roomID).emit('returnToRoomFromWXYZ', { admin: true });
        }
    }
    console.log(`${username} left the lobby!`)

}
module.exports = disconnectWXYZ;