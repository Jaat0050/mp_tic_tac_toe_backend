// importing modules

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);

const Room = require('./models/room');

var io = require('socket.io')(server);

//middle ware ==> { client -> middleware -> server }
app.use(express.json());

const DB = "mongodb+srv://jaat0050:tictactoe123@tictactoe.cfxgfml.mongodb.net/?retryWrites=true&w=majority&appName=TicTacToe";

io.on("connection", (socket) => {
    console.log("io connected!");
    socket.on("createRoom", async ({ nickname }) => {
        console.log(nickname);
        console.log(socket.id);
        try {
            // room is created
            let room = new Room();
            let player = {
                socketID: socket.id,
                nickname,
                playerType: 'X',
            };
            room.players.push(player);
            room.turn = player;
            // player is stored in the mongodb
            room = await room.save();
            console.log(room);
            const roomId = room._id.toString();

            socket.join(roomId);
            // tell client room created 
            // go to next page
            io.to(roomId).emit("createRoomSuccess", room);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("joinRoom", async ({ nickname, roomId }) => {
        console.log(nickname);
        console.log(roomId);
        console.log(socket.id);
        try {
            // check room id
            // if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
            if (!/^[0-9a-fA-F]{24}$/.test(roomId)) {
                socket.emit('errorOccurred', 'Please enter valid room ID');
                return;
            }

            let room = await Room.findById(roomId)

            if (room.isJoin) {
                let player = {
                    nickname,
                    socketID: socket.id,
                    playerType: 'O',
                }
                socket.join(roomId);
                room.players.push(player);
                room.isJoin = false;

                room = await room.save();

                // tell client room created 
                // go to next page
                io.to(roomId).emit("joinRoomSuccess", room);
                io.to(roomId).emit("updatePlayers", room.players);

                io.to(roomId).emit("updateRoom", room);

            } else {
                socket.emit('errorOccurred', 'The game is in progress, try again later!');
            }

        } catch (e) {
            console.log(e);
        }
    });
});

mongoose.connect(DB).then(() => {
    console.log("database connected successfully!");
}).catch((e) => {
    console.log(e);
});
//PROMISE in js = FUTURE in dart

server.listen(port, '0.0.0.0', () => {
    // console.log(`Server started and running on ${port}`);
    console.log("Server started and running on port: " + port);
});