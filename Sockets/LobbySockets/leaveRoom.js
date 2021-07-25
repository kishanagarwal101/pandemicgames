const roomModel = require('../../Models/roomModel');
const leaveRoom = async (socket, username, roomID) => {
    const room = await roomModel.findOne({ roomID: roomID });

    if (room) {

        if (room.users.length === 1) {
            await roomModel.deleteOne({ roomID, roomID });
        }
        //Admin Leaves
        else if (room.adminUsername === username) {
            let newAdminName = '', newAdminIndex = 0;
            for (let i = 0; i < room.users.length; i++) {
                if (room.users[i].username !== username) {
                    newAdminName = room.users[i].username;
                    newAdminIndex = i;
                    break;
                }
            }
            if (!newAdminName) {
                return await roomModel.deleteOne({ roomID, roomID });
            }
            const deleteIndex = room.users.findIndex(x => x.isAdmin);
            room.users[newAdminIndex].isAdmin = true;
            room.users.splice(deleteIndex, 1);
            room.adminUsername = newAdminName;
            const updatedRoom = await room.save();
            socket.to(roomID).emit('userLeft', { updatedRoom, username });
        }
        //UserLeaves
        else {
            const deleteIndex = room.users.findIndex(x => x.username === username);
            room.users.splice(deleteIndex, 1);
            if (room.users.length === 0) {
                return await roomModel.deleteOne({ roomID, roomID });
            }
            const updatedRoom = await room.save();

            socket.to(roomID).emit('userLeft', { updatedRoom, username });
        }
        console.log(`${socket.id} Left Lobby!`)
    }

}

module.exports = leaveRoom;