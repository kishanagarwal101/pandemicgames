const express = require('express');
const router = express.Router();
const shazamModel = require('../Models/shazamModel');
const roomModel = require('../Models/roomModel');
const axios = require('axios').default;

// router.post('/joinShazam/:roomID', (req, res) => {
//     shazamModel.findOneAndUpdate({ roomID: req.params.roomID }, { "$push": { users: req.body } }, { new: true }, (err, updatedRoom) => {
//         if (err && !room) {
//             console.error(err);
//             return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
//         }
//         res.json({ code: 200, errCode: null, room: updatedRoom });
//     });
// });
router.post('/joinShazam/:roomID', async (req, res) => {
    const room = await shazamModel.findOne({ roomID: req.params.roomID });
    let flag = false;
    if (room) {
        room.users.forEach(u => { if (u.username === req.body.username) flag = true })
        if (!flag) {
            room.users.push(req.body);
            await room.save();
            res.json({ code: 200, errCode: null, room: room });
        }
        else {
            res.json({ code: 200, message: 'already tha', errCode: null, room: room });
        }
    }
    else
        return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
});
router.get('/getSongList', (req, res) => {
    axios.get('https://apg-saavn-api.herokuapp.com/playlist/?q=https://www.jiosaavn.com/s/playlist/cafd605a5d8835b5ca99d063d892a00d/pandemic_games/9oZHUTy3BCVieSJqt9HmOQ__')
        .then(function (response) {
            const songList = response.data.songs;
            return res.json({ code: 200, errCode: null, songList: songList });
        })
})
router.post('/updateShazamScore/:roomID', (req, res) => {
    let username = req.body.username;
    let score = req.body.score;
    shazamModel.findOneAndUpdate({
        "roomID": req.params.roomID,
        "users.username": username,
    }, {
        "$set": {
            "users.$.score": score
        }
    }, { new: true }, function (error, success) {
        if (error) {
            console.log(error)
            return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
        }
        else {
            res.json({ code: 200, errCode: null, room: success });
        }
    })
})
module.exports = router;