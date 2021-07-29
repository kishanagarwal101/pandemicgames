const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String },
    isAdmin: { type: Boolean },
    score: { type: Number }
});

const shazamSchema = mongoose.Schema({
    roomID: { type: String, required: true, unique: true },
    users: { type: [userSchema] },
    roomName: { type: String, required: true },
    adminUsername: { type: String },
    playListUrl: { type: String },
    numberOfRounds: { type: Number },
});

const shazamModel = new mongoose.model('shazamModel', shazamSchema);
module.exports = shazamModel;