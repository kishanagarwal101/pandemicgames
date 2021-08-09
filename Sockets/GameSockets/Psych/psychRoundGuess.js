const psychRoundGuess = (io, gameState, username, value, roomID)=>{
    gameState.forEach((i)=>{
        if(i.username===username){
            i.prompt = value;
        }
    });
    let unprompted = 0;
    gameState.forEach(i=>{
        if(i.prompt===null){
            unprompted++;
        }
    });
    if(unprompted===0){
        io.in(roomID).emit('roundGuess', gameState);
        setTimeout(()=>{
            io.in(roomID).emit('startVoting');
        }, 1000);
    }
    else io.in(roomID).emit('roundGuess', gameState);
}

module.exports = psychRoundGuess;