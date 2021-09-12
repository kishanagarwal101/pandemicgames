const ticTacToeModel = require("../../../Models/tictactoeModel");
const roomModel = require("../../../Models/roomModel");
const disconnectTTT = async (username, roomID, socket) => {
    const room = await ticTacToeModel.findOne({ roomID })
    if (room) {
        if (room.adminUsername === username) {
            const newAdmin = room.users[0].username === username ? room.users[1].username : room.users[0].username;
            await ticTacToeModel.deleteOne({ roomID: roomID });
            const payload = {
                roomID: roomID,
                users: [],
                roomName: room.roomName,
                adminUsername: newAdmin,
                selectedGame: -1
            }
            const newLobby = new roomModel(payload);
            await newLobby.save();
            socket.to(roomID).emit('returnToRoomFromTTT', { admin: true });
        }
        else {
            await ticTacToeModel.deleteOne({ roomID: roomID });
            const payload = {
                roomID: roomID,
                users: [],
                roomName: room.roomName,
                adminUsername: username,
                selectedGame: -1
            }
            const newLobby = new roomModel(payload);
            await newLobby.save();
            socket.to(roomID).emit('returnToRoomFromTTT', { admin: true });
        }
    }
    console.log(`${username} left the lobby!`)

}
module.exports = disconnectTTT;