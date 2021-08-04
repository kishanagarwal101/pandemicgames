const express = require('express');
const router = express.Router();
const shazamModel = require('../Models/shazamModel');
const roomModel = require('../Models/roomModel');
const axios = require('axios').default;
router.post('/joinShazam/:roomID', (req, res) => {
    shazamModel.findOneAndUpdate({ roomID: req.params.roomID }, { "$push": { users: req.body } }, { new: true }, (err, updatedRoom) => {
        if (err && !room) {
            console.error(err);
            return res.json({ code: 500, errCode: 500, message: 'Internal Server Error!' });
        }
        res.json({ code: 200, errCode: null, room: updatedRoom });
    });
});
router.get('/getSongList', (req, res) => {
    axios.get('https://apg-saavn-api.herokuapp.com/playlist/?q=https://www.jiosaavn.com/s/playlist/cafd605a5d8835b5ca99d063d892a00d/pandemic_games/9oZHUTy3BCVieSJqt9HmOQ__')
        .then(function (response) {
            const songList = response.data.songs;
            return res.json({ code: 200, errCode: null, songList: songList });
        })

})
module.exports = router;