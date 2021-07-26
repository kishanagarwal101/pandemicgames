const express = require('express');
const router = express.Router();
const tictactoeModel = require('../Models/tictactoeModel')

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


module.exports = router