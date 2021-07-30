const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String },
  isAdmin: { type: Boolean },
  lives: { type: Number },
});

const wxyzSchema = mongoose.Schema({
  roomID: { type: String, required: true, unique: true },
  users: { type: [userSchema] },
  roomName: { type: String, required: true },
  adminUsername: { type: String },
  numberOfRounds: { type: Number },
  isTurn: { type: String },
});

const wxyzModel = new mongoose.model("wxyzModel", wxyzSchema);

module.exports = wxyzModel;
