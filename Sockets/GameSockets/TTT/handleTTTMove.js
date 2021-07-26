const checkWinner = (gameState) => {
    if (gameState[0][0].user === gameState[0][1].user && gameState[0][1].user === gameState[0][2].user && gameState[0][2].user) {
        console.log('1st statement');
        return gameState[0][2].user
    };
    if (gameState[1][0].user === gameState[1][1].user && gameState[1][1].user === gameState[1][2].user && gameState[1][2].user) {
        console.log('2nd statement');
        return gameState[1][2].user
    };
    if (gameState[2][0].user === gameState[2][1].user && gameState[2][1].user === gameState[2][2].user && gameState[2][2].user) {
        console.log('3rd statement');
        return gameState[2][2].user;
    };

    if (gameState[0][0].user === gameState[1][0].user && gameState[1][0].user === gameState[2][0].user && gameState[2][0].user) {
        console.log('4th statement');
        return gameState[2][0].user;
    }
    if (gameState[0][1].user === gameState[1][1].user && gameState[1][1].user === gameState[2][1].user && gameState[2][1].user) {
        console.log('5 th statement');
        return gameState[2][1].user;
    }
    if (gameState[0][2].user === gameState[1][2].user && gameState[1][2].user === gameState[2][2].user && gameState[2][2].user) {
        console.log('6th statement');
        return gameState[2][2].user;
    }

    if (gameState[0][0].user === gameState[1][1].user && gameState[1][1].user === gameState[2][2].user && gameState[2][2].user) {
        console.log('7th statement');
        return gameState[2][2].user;
    }
    if (gameState[0][2].user === gameState[1][1].user && gameState[1][1].user === gameState[2][0].user && gameState[2][0].user) {
        console.log('8th statement');
        return gameState[2][0].user;
    }
    return null;
}

const isDraw = (gameState, myWeightArray, opponentWeightArray) => {

    let c = 0;
    for (let i = 0; i < 5; i++) {
        if (myWeightArray[i] > 0) {
            c++;
        }
        if (opponentWeightArray[i] > 0) {
            c++;
        }
        if (c >= 2)
            return false;
    }

    if (c === 1) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (gameState.user === null)
                    return false;
            }
        }
        return true;
    }
    return false;
}
const handleTTTMove = (socket, io, gameState, myWeightArray, roomID, opponentWeightArray) => {
    //winner
    if (checkWinner(gameState)) {
        socket.to(roomID).emit('TTTLost', { gameState, incomingWeightArray: myWeightArray });
        io.to(socket.id).emit('TTTWon');
        return;
    }

    if (isDraw(gameState, myWeightArray, opponentWeightArray))
        return io.in(roomID).emit('TTTDraw', { gameState, incomingWeightArray: myWeightArray });

    socket.to(roomID).emit('TTTMove', { gameState, incomingWeightArray: myWeightArray });
}

module.exports = handleTTTMove;
