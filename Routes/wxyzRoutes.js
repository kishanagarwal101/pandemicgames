const express = require('express');
const router = express.Router();
const wxyzModel = require('../Models/wxyzModel');
const roomModel = require('../Models/roomModel');

router.post('/joinWXYZ/:roomID', (req, res) => {
    wxyzModel.findOneAndUpdate({ roomID: req.params.roomID }, { "$push": { users: req.body } }, { new: true }, (err, updatedRoom) => {
        if (err) {
            console.error(err);
            return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
        }
        res.json({ code: 200, errCode: null, room: updatedRoom });
    });
});

module.exports = router;