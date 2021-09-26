require("dotenv").config();

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const roomModel = require('./Models/roomModel');
const roomRoutes = require('./Routes/roomRoutes');
const tictactoeRoutes = require('./Routes/tictactoeRoutes');
const psychRoutes = require('./Routes/psychRoutes')
const shazamRoutes = require('./Routes/shazamRoutes');
const path = require('path');
const joinGame = require('./Sockets/LobbySockets/joinGame');
const leaveRoom = require('./Sockets/LobbySockets/leaveRoom');
const handleTTTMove = require('./Sockets/GameSockets/TTT/handleTTTMove');
const disconnectTTT = require('./Sockets/GameSockets/TTT/disconnectTTT');
const psychRoundStart = require('./Sockets/GameSockets/Psych/psychRoundStart');
const psychRoundGuess = require('./Sockets/GameSockets/Psych/psychRoundGuess');
const psychRoundVote = require('./Sockets/GameSockets/Psych/psychRoundVote');
const handleDisconnect = require('./Sockets/GameSockets/Psych/handleDisconnect');
const disconnectShazam = require('./Sockets/GameSockets/shazam/disconnectShazam')
const wxyzRoutes = require("./Routes/wxyzRoutes");
const disconnectWXYZ = require("./Sockets/GameSockets/WXYZ/disconnectWXYZ");

//DB Connection
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }, () => {
  console.log("Connected to Pandemic DB!")
});


//Server Setup
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 5000;

//Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
  next();
});

//Global Socket Routes
io.on("connection", (socket) => {
  //User Joined
  socket.on("userJoined", ({ users, roomID, username }) => {
    socket.join(roomID);
    console.log(`${socket.id} Joined Lobby`);
    socket.to(roomID).emit("userJoined", { users, username });
    socket.on("chatMessage", (payload) =>
      io.in(roomID).emit("chatMessage", payload)
    );
    socket.on("changeSelectedGame", async ({ gameCode }) => {
      await roomModel.updateOne({ roomID: roomID }, { selectedGame: gameCode });
      io.in(roomID).emit("changeSelectedGame", { gameCode });
    });
    socket.on("startGame", async ({ gameCode, room }) => {
      await roomModel.deleteOne({ roomID });
      joinGame(io, gameCode, roomID, room);
    });
    socket.on("disconnect", () => leaveRoom(socket, username, roomID));
  });
  //TTT
  socket.on("userJoinedTTT", ({ users, roomID, username }) => {
    socket.join(roomID);
    console.log(`${socket.id} Joined TTT`);
    socket.to(roomID).emit("userJoinedTTT", { users, username });
    socket.on("chatMessage", (payload) =>
      io.in(roomID).emit("chatMessage", payload)
    );

    socket.on(
      "TTTMove",
      ({ gameState, myWeightArray, opponentWeightArray }) => {
        handleTTTMove(
          socket,
          io,
          gameState,
          myWeightArray,
          roomID,
          opponentWeightArray
        );
      }
    );

    socket.on("TTTReset", () => io.in(roomID).emit("TTTReset"));
    socket.on("disconnect", () => {
      disconnectTTT(username, roomID, socket);
    });
    socket.on("returnToRoomFromTTT", () =>
      io.in(roomID).emit("returnToRoomFromTTT")
    );
  });

  //Psych
  socket.on('userJoinedPsych', ({ users, roomID, username }) => {
    socket.join(roomID);
    console.log(`${socket.id} Joined Psych`);
    socket.to(roomID).emit('userJoinedPsych', { users, username });
    socket.on('chatMessage', (payload) => io.in(roomID).emit('chatMessage', payload));
    socket.on('gameInitialized', () => io.in(roomID).emit('gameInitialized'));
    socket.on('roundStart', () => {
      psychRoundStart(io, roomID);
    });
    socket.on('roundGuess', (payload) => {
      psychRoundGuess(io, payload.gameState, payload.username, payload.value, roomID);
    });
    socket.on('psychRoundvote', (payload) => {
      psychRoundVote(io, payload, roomID);
    });
    socket.on('disconnect', () => {
      handleDisconnect(io, socket, roomID, username);
    })
  });

  //Shazam
  socket.on('userJoinedShazam', ({ users, roomID, username }) => {
    socket.join(roomID);
    console.log(`${socket.id} Joined Shazam`);
    socket.to(roomID).emit('userJoinedShazam', { users, username });
    socket.on('ShazamChatMessage', (payload) => {
      io.in(roomID).emit('ShazamChatMessage', payload)
    });
    socket.on('ShazamChatMessageAfterGuess', (payload) => {
      io.in(roomID).emit('ShazamChatMessageAfterGuess', payload)
    });
    socket.on('ShazamStart', (songListLength) => {
      let number = Math.floor(Math.random() * (songListLength));
      console.log(number);
      io.in(roomID).emit('ShazamStart', number)
    });
    socket.on('ShazamSongParty', () => io.in(roomID).emit('ShazamSongParty'))
    socket.on('ShazamOver', () => io.in(roomID).emit('ShazamOver'))
    socket.on('shazamReset', () => io.in(roomID).emit('shazamReset'))

    ///leaveRoom
    socket.on('returnToRoomFromleaveShazam',
      () => io.in(roomID).emit('returnToRoomFromleaveShazam'));
    socket.on('disconnect', () => {
      console.log(username)
      disconnectShazam(username, roomID, socket, io);
    })
  })

  //WXYZ
  socket.on("userJoinedWXYZ", ({ users, roomID, username }) => {
    socket.join(roomID);
    console.log(`${socket.id} Joined WXYZ`);
    socket.to(roomID).emit("userJoinedWXYZ", { users, username });
    socket.on("chatMessage", (payload) =>
      io.in(roomID).emit("chatMessage", payload)
    );
    socket.on("disconnect", () => {
      disconnectWXYZ(username, roomID, socket);
    });
    socket.on("returnToRoomFromWXYZ", () =>
      io.in(roomID).emit("returnToRoomFromWXYZ")
    );
    socket.on("startWXYZ", () =>
      io.in(roomID).emit("WXYZTurn", { position: 0 })
    );
    socket.on("WXYZTurn", (res) => {
      io.in(roomID).emit("WXYZTurn", { position: res });
    });
    socket.on("WXYZstr", (res) => {
      io.in(roomID).emit("WXYZstr", { str: res });
    });
    socket.on("WXYZReduceLives", (res) => {
      io.in(roomID).emit("WXYZReduceLives", { pos: res });
    });
    socket.on("WXYZcorrectAnswerRotate", (res) => {
      io.in(roomID).emit("WXYZcorrectAnswerRotate", { liveChecker: res });
    });
    socket.on("WXYZwrongAnswerRotate", (res) => {
      io.in(roomID).emit("WXYZcorrectAnswerRotate", { liveChecker: res });
    });
    socket.on("WXYZwinner", (res) => {
      io.in(roomID).emit("WXYZwinner", { winner: res });
    });
    socket.on("returnToRoomFromleaveWXYZ", () =>
      io.in(roomID).emit("returnToRoomFromleaveWXYZ")
    );
    socket.on("disconnect", () => {
      disconnectWXYZ(username, roomID, socket, io);
    });

  });
});

  //@ Reponse Object JSON Format
  //@ Every Object must have:
  //@ {code:Number, errCode: Number || null, message:String}
  //@ Additional Params: any || null
  //Test Route
  app.get("/test", (req, res) => {
    res.json({
      code: 200,
      errCode: null,
      message: `Server Running on Port: ${PORT}`,
    });
  });
  app.use("/", roomRoutes);
  app.use("/", tictactoeRoutes);
  app.use("/", psychRoutes);
  app.use("/", shazamRoutes);
  app.use("/", wxyzRoutes);

  app.use(express.static(path.join(__dirname, "frontend", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });

  server.listen(PORT, () => {
    console.log(`PORT: ${PORT}`);
  });
