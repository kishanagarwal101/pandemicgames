const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean },
    score: { type: Number }
});

const shazamSchema = mongoose.Schema({
    roomID: { type: String, required: true, unique: true },
    users: { type: [userSchema], unique: true },
    roomName: { type: String, required: true },
    adminUsername: { type: String },
    playListUrl: { type: String },
    numberOfRounds: { type: Number },
});

const shazamModel = new mongoose.model('shazamModel', shazamSchema);
module.exports = shazamModel;