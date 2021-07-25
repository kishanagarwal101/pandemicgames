const joinGame = (io, gameCode, roomID) => {
    if (gameCode === 3) {
        io.in(roomID).emit('TTTStart');
    }
}

module.exports = joinGame;