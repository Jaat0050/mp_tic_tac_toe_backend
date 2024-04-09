// importing modules

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);

var io = require('socket.io')(server);

//middle ware ==> { client -> middleware -> server }
app.use(express.json());

const DB = "mongodb+srv://jaat0050:tictactoe123@tictactoe.cfxgfml.mongodb.net/?retryWrites=true&w=majority&appName=TicTacToe";

io.on("connection", (socket) => {
    console.log("io connected!");
    socket.on("createRoom", ({ nickname }) => {
        console.log(nickname);
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