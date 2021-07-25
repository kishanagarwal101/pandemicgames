const ticTacToeModel = require('../../Models/tictactoeModel');

const joinGame = async (io, gameCode, roomID, room) => {
    if (gameCode === 3) {
        const newTicTacToe = new ticTacToeModel({
            roomID: roomID,
            users: [],
            adminUsername: room.adminUsername,
            roomName: room.roomName
        });
        await newTicTacToe.save();
        io.in(roomID).emit('TTTStart');
    }
}

module.exports = joinGame;