require('dotenv').config();

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const roomModel = require('./Models/roomModel');
const roomRoutes = require('./Routes/roomRoutes');
const tictactoeRoutes = require('./Routes/tictactoeRoutes');
const shazamRoutes = require('./Routes/shazamRoutes');
const path = require('path');
const joinGame = require('./Sockets/LobbySockets/joinGame');
const leaveRoom = require('./Sockets/LobbySockets/leaveRoom');
const handleTTTMove = require('./Sockets/GameSockets/TTT/handleTTTMove');
const disconnectTTT = require('./Sockets/GameSockets/TTT/disconnectTTT');
const axios = require('axios').default;
//DB Connection
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }, () => {
    console.log("Connected to Pandemic DB!")
});


//Server Setup
const app = express();
const server = http.createServer(app)
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
io.on('connection', (socket) => {
    socket.on('userJoined', ({ users, roomID, username }) => {
        socket.join(roomID);
        console.log(`${socket.id} Joined Lobby`);
        socket.to(roomID).emit('userJoined', { users, username });
        socket.on('chatMessage', (payload) => io.in(roomID).emit('chatMessage', payload));
        socket.on('changeSelectedGame', async ({ gameCode }) => {
            await roomModel.updateOne({ roomID: roomID }, { selectedGame: gameCode });
            io.in(roomID).emit('changeSelectedGame', { gameCode });
        });
        socket.on('startGame', async ({ gameCode, room }) => {
            await roomModel.deleteOne({ roomID });
            joinGame(io, gameCode, roomID, room)
        });
        socket.on('disconnect', () => leaveRoom(socket, username, roomID))
    });

    socket.on('userJoinedTTT', ({ users, roomID, username }) => {
        socket.join(roomID);
        console.log(`${socket.id} Joined TTT`);
        socket.to(roomID).emit('userJoinedTTT', { users, username });
        socket.on('chatMessage', (payload) => io.in(roomID).emit('chatMessage', payload));

        socket.on('TTTMove', ({ gameState, myWeightArray, opponentWeightArray }) => {
            handleTTTMove(socket, io, gameState, myWeightArray, roomID, opponentWeightArray);
        });

        socket.on('TTTReset', () => io.in(roomID).emit('TTTReset'));
        socket.on('disconnect', () => {
            disconnectTTT(username, roomID, socket);
        })
        socket.on('returnToRoomFromTTT', () => io.in(roomID).emit('returnToRoomFromTTT'))
    });
    socket.on('userJoinedShazam', ({ users, roomID, username }) => {
        socket.join(roomID);
        console.log(`${socket.id} Joined Shazam`);
        socket.to(roomID).emit('userJoinedShazam', { users, username });
        socket.on('ShazamChatMessage', (payload) => io.in(roomID).emit('ShazamChatMessage', payload));
        socket.on('ShazamChatMessageGuessed', (payload) => io.in(roomID).emit('ShazamChatMessageGuessed', payload));
        socket.on('ShazamUserCorrectGuess', (payload) => socket.to(roomID).emit('ShazamUserCorrectGuess', payload));
        socket.on('ShazamStart', () => io.in(roomID).emit('ShazamStart'));
    })
});

app.get('/test', (req, res) => {
    res.json({
        code: 200,
        errCode: null,
        message: `Server Running on Port: ${PORT}`
    });
});
app.use('/', roomRoutes);
app.use('/', tictactoeRoutes);
app.use('/', shazamRoutes);
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`PORT: ${PORT}`)
});

