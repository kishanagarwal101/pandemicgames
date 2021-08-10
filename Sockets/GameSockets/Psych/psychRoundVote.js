const psychRoundStart = require("./psychRoundStart") ;
const psychRoundVote = (io, payload, roomID)=>{
    let updatedGameState = payload.gameState;
    updatedGameState.forEach((i)=>{
        if(i.username===payload.voter){
            i.hasVoted = true;
        }
        if(i.username===payload.votee){
            i.vote.push(payload.voter);
        }
    });
    let unvoted = 0;
    updatedGameState.forEach((i)=>{
        if(!i.hasVoted)unvoted++;
    });
    if(unvoted===0){
        io.in(roomID).emit('psychRoundVote', {gameState:updatedGameState});
        //Update Scores
        setTimeout(()=>{
            io.in(roomID).emit('showResults');
        }, 1000);
        setTimeout(()=>{
            psychRoundStart(io, roomID);
        }, 8000);
    }
    else io.in(roomID).emit('psychRoundVote', {gameState:updatedGameState});

}

module.exports = psychRoundVote;