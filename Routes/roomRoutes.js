const express = require('express');
const router = express.Router();
const roomModel = require('../Models/roomModel');
const UUID = require('../Utils/UUID');
const roomExist = require('../Utils/roomExist');

router.post('/createRoom', async (req, res) => {
    const newRoom = new roomModel(req.body);
    while (true) {
        let roomID = UUID(6);
        const doesRoomExist = await roomExist(roomID);
        if (!doesRoomExist) {
            newRoom.roomID = roomID;
            break;
        }
    }
    newRoom.save((err, room) => {
        if (err) {
            console.error(err);
            return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
        }
        else {
            res.json({ code: 200, errCode: null, message: "Room Created", room: room });
        }
    });
});

router.get('/validateUsername/:roomID/:username', (req, res) => {
    roomModel.findOne({ roomID: req.params.roomID }, (err, room) => {
        if (err) {
            console.error(err);
            return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
        }
        if (!room) return res.json({ code: 404, errCode: 404, message: "Room Not Found!" })
        let auth = true;
        room.users.forEach(r => {
            if (r.username === req.params.username) auth = false;
        });
        if (auth) {
            return res.json({ code: 200, errCode: null, message: "Valid Username" });
        }
        return res.json({ code: 304, errCode: 11, message: "Username Already Taken!" });

    });
});

router.post('/joinRoom/:roomID', (req, res) => {
    roomModel.findOneAndUpdate({ roomID: req.params.roomID }, { "$push": { users: req.body } }, { new: true }, (err, room) => {
        if (err) {
            console.error(err);
            return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
        }
        else {
            res.json({ code: 200, errCode: null, message: "Room Joined", room: room });
        }
    });
})




module.exports = router;