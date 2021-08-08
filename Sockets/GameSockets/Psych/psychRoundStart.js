const psychModel = require('../../../Models/psychModel');
const psychQuestions = require('../../../Utils/psychQuestions.json');
const {coinFlip, getRandomFromArray} = require('../../../Utils/Random');
const psychRoundStart = async (io, roomID)=>{
    const room = await psychModel.findOne({roomID});
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