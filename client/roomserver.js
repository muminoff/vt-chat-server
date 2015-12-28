var io = require('socket.io');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(socket) {

    function joinRoom(socket, room) {
        if (socket.room) {
            socket.leave(socket.room);
        }
        socket.join(room);
        socket.room = room;
        console.info(socket.id + ' joined room ' + room, socket.room);
    }

    socket.on('message', function(data, callback) {
        if (data.event === 'connected' && data.data.room) {
            socket.join(data.data.room);
            console.log(socket.id + ' Joined Room ' + data.data.room);
            socket.room = data.data.room // stash the room ID on the socket object to make it easy to recall.
        }
        socket.broadcast.to(socket.room).emit('message', data);

    });
});
