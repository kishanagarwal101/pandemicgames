const psychRoundStart = require("./psychRoundStart") ;
const psychModel = require('../../../Models/psychModel');
const psychScore = require('../../../Utils/psychScore');
const psychRoundVote = async (io, payload, roomID)=>{
    let updatedGameState = payload.gameState;
    updatedGameState.forEach((i)=>{
        if(i.username===payload.voter){
            i.hasVoted = true;
        }
        if(i.username===payload.votee){
            i.vote.push(payload.voter);
        }
    });
    await psychModel.findOneAndUpdate({roomID}, {users:updatedGameState});
    console.log(updatedGameState)
    let unvoted = 0;
    updatedGameState.forEach((i)=>{
        if(!i.hasVoted)unvoted++;
    });
    if(unvoted===0){
        io.in(roomID).emit('psychRoundVote', {gameState:updatedGameState});
        //Update Scores
        let oldUserState = updatedGameState;
        oldUserState.forEach((i)=>{
            i.points += psychScore(i.vote.length);
            i.vote = [];
            i.prompt=null;
            i.hasVoted=false;
        });
        await psychModel.findOneAndUpdate({roomID: roomID}, {users: oldUserState});


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