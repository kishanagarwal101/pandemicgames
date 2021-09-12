const psychModel = require('../../../Models/psychModel');

const handleDisconnect = async (io, socket, roomID, username) => {
    console.log(`${username} Left Psych Room`)
    const room = await psychModel.findOne({ roomID });
    if (room) {
        const newUserList = room.users.filter(user => user.username !== username);
        //Check If Admin Left
        let hasAdmin = false;
        newUserList.forEach(user => {
            if (user.isAdmin) {
                hasAdmin = true;
            }
        });
        //Make New Admin
        if (!hasAdmin) {
            newUserList[0].isAdmin = true;
        }
        io.in(roomID).emit('changeAdmin', { adminUsername: username })
        await psychModel.findOneAndUpdate({ roomID }, { users: newUserList });
        io.in(roomID).emit('userLeftPsychRoom', { newGameState: newUserList });
        let unvoted = 0, unguessed = 0;
        newUserList.forEach(user => {
            if (!user.prompt) unguessed++;
            if (!user.hasVoted) unvoted++;
        });

        if (unvoted === 0) {
            //SHOW RESULTS
            setTimeout(() => {
                io.in(roomID).emit('showResults');
            }, 1000);
        }

        if (unguessed === 0) {
            //START VOTING
            setTimeout(() => {
                io.in(roomID).emit('startVoting');
            }, 1000);
        }
    }

    //DO NOTHING
}

module.exports = handleDisconnect;