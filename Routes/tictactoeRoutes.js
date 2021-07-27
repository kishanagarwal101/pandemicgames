const express = require('express');
const router = express.Router();
const tictactoeModel = require('../Models/tictactoeModel');
const roomModel = require('../Models/roomModel');
router.post('/joinTTT/:roomID', (req, res) => {
    tictactoeModel.findOneAndUpdate({ roomID: req.params.roomID }, { "$push": { users: req.body } }, { new: true }, (err, updatedRoom) => {
        if (err) {
            console.error(err);
            return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
        }
        console.log(updatedRoom);
        res.json({ code: 200, errCode: null, room: updatedRoom });
    });
});

router.get('/leaveTTT/:roomID', async (req, res) => {
    try {
        let roomID = req.params.roomID;
        const currentTTT = await tictactoeModel.findOne({ roomID: roomID });
        const newRoom = new roomModel(
            {
                roomID: roomID,
                users: [],
                adminUsername: currentTTT.adminUsername,
                roomName: currentTTT.roomName
            }
        );
        await newRoom.save();
        await tictactoeModel.deleteOne({ roomID: roomID });
        return res.json({ code: 200, errCode: null, message: 'TTT redirecting!' });
    } catch (err) {
        console.error(err);
        return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
    }
});
module.exports = router;