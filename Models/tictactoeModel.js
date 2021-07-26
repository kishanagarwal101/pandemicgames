const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String },
    isAdmin: { type: Boolean }
});

const ticTacToeSchema = mongoose.Schema({
    roomID: { type: String, required: true, unique: true },
    users: { type: [userSchema] },
    roomName: { type: String, required: true },
    adminUsername: { type: String },
    lastTurn: { type: String }
});

const ticTacToeModel = new mongoose.model('ticTacToeModel', ticTacToeSchema);

module.exports = ticTacToeModel;