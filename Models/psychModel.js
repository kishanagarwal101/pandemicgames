const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String },
    isAdmin: { type: Boolean },
    score: { type: Number }
});

const psychSchema = mongoose.Schema({
    roomID: { type: String, required: true, unique: true },
    users: { type: [userSchema] },
    roomName: { type: String, required: true },
    adminUsername: { type: String },
});

const psychModel = new mongoose.model('psychModel', psychSchema);
module.exports = psychModel;