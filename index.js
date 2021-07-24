require('dotenv').config();

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');

const roomRoutes = require('./Routes/roomRoutes')

const leaveRoom = require('./Sockets/LobbySockets/leaveRoom')
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
    console.log(`${socket.id} Joined`);
    socket.on('userJoined', ({ users, roomID, username }) => {
        socket.join(roomID);
        socket.to(roomID).emit('userJoined', { users, username });

        socket.on('chatMessage', (payload) => io.in(roomID).emit('chatMessage', payload));

        socket.on('disconnect', () => leaveRoom(socket, username, roomID))
    });
});

//@ Reponse Object JSON Format
//@ Every Object must have:
//@ {code:Number, errCode: Number || null, message:String}
//@ Additional Params: any || null
//Test Route
app.get('/test', (req, res) => {
    res.json({
        code: 200,
        errCode: null,
        message: `Server Running on Port: ${PORT}`
    });
});
app.use('/', roomRoutes)
server.listen(PORT, () => console.log(`PORT: ${PORT}`));


