const express = require("express");
const router = express.Router();
const wxyzModel = require("../Models/wxyzModel");
const roomModel = require("../Models/roomModel");
const fs = require("fs");
const wordListPath = require("word-list");

router.post("/joinWXYZ/:roomID", (req, res) => {
  wxyzModel.findOneAndUpdate(
    { roomID: req.params.roomID },
    { $push: { users: req.body } },
    { new: true },
    (err, updatedRoom) => {
      if (err) {
        console.error(err);
        return res.json({
          code: 500,
          errCode: 500,
          message: "Internal Server Error!",
        });
      }
      res.json({ code: 200, errCode: null, room: updatedRoom });
    }
  );
});

router.get("/wordList", (req, res) => {
  const wordArray = fs.readFileSync(wordListPath, "utf8").split("\n");
  res.json({ code: 200, errCode: null, wordList: wordArray });
});

router.get("/wordStr", (req, res) => {
  const wordArray = fs.readFileSync(wordListPath, "utf8").split("\n");
  const wordNo = Math.floor(Math.random() * 274400);
  const word = wordArray[wordNo];
  console.log(word);
  const noOfLetters = Math.floor(Math.random() * 2) + 2;
  const startPosition = Math.floor(Math.random() * (word.length - 1));
  const str = word.substr(startPosition, noOfLetters);
  res.json({ code: 200, errCode: null, str: str });
});

router.get("/leaveWXYZ/:roomID", async (req, res) => {
  try {
    let roomID = req.params.roomID;
    const currentWXYZ = await wxyzModel.findOne({ roomID: roomID });
    console.log(currentWXYZ);
    const newRoom = new roomModel({
      roomID: roomID,
      users: [],
      adminUsername: currentWXYZ.adminUsername,
      roomName: currentWXYZ.roomName,
      selectedGame: -1,
    });
    await newRoom.save();
    await wxyzModel.deleteOne({ roomID: roomID });
    return res.json({ code: 200, errCode: null, message: "WXYZ redirecting!" });
  } catch (err) {
    console.error(err);
    return res.json({
      code: 500,
      errCode: 500,
      message: "Internal Server Error!",
    });
  }
});

module.exports = router;
