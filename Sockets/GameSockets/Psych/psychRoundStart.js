const psychModel = require('../../../Models/psychModel');
const psychQuestions = require('../../../Utils/psychQuestions.json');
const {coinFlip, getRandomFromArray} = require('../../../Utils/Random');
const roomModel = require('../../../Models/roomModel');
const psychRoundStart = async (io, roomID)=>{
    const room = await psychModel.findOne({roomID});
    if(room.gameCount<5){
        const newRoom = await psychModel.findOneAndUpdate({roomID}, {"$inc": { gameCount: 1 }});
        console.log(newRoom);
    }
    else{
        const newRoom = new roomModel({
            roomID : roomID,
            users: [],
            roomName: room.roomName,
            adminUsername: room.adminUsername,
            selectedGame: -1

        });
        await newRoom.save();

        await psychModel.findOneAndDelete({roomID});
        io.in(roomID).emit('returnToLobbyFromPsych');
        return;
    }
    const category = coinFlip();
    const question = category===0?getRandomFromArray(psychQuestions.single):getRandomFromArray(psychQuestions.couple);
    const NAME1 = getRandomFromArray(room.users);
    let NAME2 = getRandomFromArray(room.users);
    while(NAME1.username===NAME2.username)NAME2 = getRandomFromArray(room.users);
    
    const roundQuestion = question.replace("$NAME1$", NAME1.username).replace("$NAME2$", NAME2.username);

    io.in(roomID).emit('roundStart', {
        users:room.users,
        roundQuestion
    });
}

module.exports = psychRoundStart;