const ticTacToeModel = require('../../Models/tictactoeModel');
const shazamModel = require('../../Models/shazamModel');
const psychModel = require('../../Models/psychModel');
const joinGame = async (io, gameCode, roomID, room) => {
    if (gameCode === 1) {
        const newShazamModel = new shazamModel({
            roomID: roomID,
            users: [],
            adminUsername: room.adminUsername,
            roomName: room.roomName,
            playListUrl: "https://www.jiosaavn.com/s/playlist/cafd605a5d8835b5ca99d063d892a00d/pandemic_games/9oZHUTy3BCVieSJqt9HmOQ__",
            numberOfRounds: 5,
        });
        await newShazamModel.save();
        io.in(roomID).emit('ShazamStart');
    }

    if(gameCode === 2){
        const newPsychmodel = new psychModel({
            roomID: roomID,
            users: [],
            roomName: room.roomName,
            adminUsername: room.adminUsername,
        });
        await newPsychmodel.save();
        io.in(roomID).emit('psychStart');
    }

    if (gameCode === 3) {
        const newTicTacToe = new ticTacToeModel({
            roomID: roomID,
            users: [],
            adminUsername: room.adminUsername,
            roomName: room.roomName,
            lastTurn: room.adminUsername
        });
        await newTicTacToe.save();
        io.in(roomID).emit('TTTStart');
    }
}

module.exports = joinGame;