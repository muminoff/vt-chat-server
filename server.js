var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var logger = require('./logger');
var config = require('./utils/config');
var signupUser = require('./api/signup');
var port = process.env.PORT || config.port;

io.on('connection', function (socket) {

  logger.debug("Client connected", socket.handshake.address);
  logger.debug("Socket ID:", socket.id);

  socket.on('signup_request', function(data){
    var username = data.username;
    var phone_number = data.phone_number;
    var apiResponse = signupUser(username, phone_number, logger);
    socket.emit('signup_response', JSON.stringify(apiResponse));
  });


  socket.on('disconnect', function(){
    logger.debug("Client disconnected", socket.id);
  });

});

server.listen(port, function () {
  logger.info('Server listening at port %d', port);
});
