var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var pg = require('pg');
var config = require('./utils/config');
var logger = require('./logger');
var config = require('./utils/config');
var pgUsername = config.postgresql.user;
var pgPassword = config.postgresql.pass;
var pgHostname = config.postgresql.host;
var pgPort = config.postgresql.port;
var pgDBName = config.postgresql.name;
var pgConnectionString = 'postgres://' + pgUsername + ':' + pgPassword + '@' + pgHostname + ':' + pgPort.toString() + '/' + pgDBName;
var port = process.env.PORT || config.port;
var signupUser = require('./api/signup');

// Set log level from config
logger.level = config.log_level;

// Initialize DB with client pool
pg.connect(pgConnectionString, function(err, client, done) {

  // On database connection failure
  if(err){
    logger.error('Cannot connect to DB');
    logger.error(err);
    process.exit(-1);
  } else {
    logger.info('Connected to DB');
  }

  // Client connected
  io.on('connection', function (socket) {

    logger.debug('Client connected', socket.handshake.address);
    logger.debug('Socket ID:', socket.id);

    // Signup request api
    socket.on('signup_request', function(data){
      var username = data.username;
      var phone_number = data.phone_number;
      signupUser(client, username, phone_number, logger, function(token){
        done();
        socket.username = username;
        socket.token = token;
        socket.emit('signup_response', token);
      });
    });

    // Signin request api
    socket.on('signin_request', function(data){
      var token = data.username;
      signinUser(client, token, logger, function(username, token){
        done();
        socket.username = username;
        socket.token = token;
        socket.emit('signin_response', msg);
      });
    });

    // Client disconnected 
    socket.on('disconnect', function(){
      logger.debug('Client disconnected', socket.id);
      logger.debug('Client token was', socket.token);
    });

  });

});

server.listen(port, function () {
  logger.info('Server listening at port %d', port);
});
