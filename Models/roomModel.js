const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String },
    isAdmin: { type: Boolean }
});

const roomSchema = mongoose.Schema({
    roomID: { type: String, required: true, unique: true },
    users: { type: [userSchema] },
    roomName: { type: String, required: true },
    adminUsername: { type: String },
    selectedGame: { type: Number }
});

const roomModel = new mongoose.model('roomModel', roomSchema);

module.exports = roomModel;