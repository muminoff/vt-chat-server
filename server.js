// Main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var pg = require('pg');

// Logger and config
var logger = require('./logger');
var config = require('./utils/config');

// Variables
var pgUsername = config.postgresql.user;
var pgPassword = config.postgresql.pass;
var pgHostname = config.postgresql.host;
var pgPort = config.postgresql.port;
var pgDBName = config.postgresql.name;
var pgConnectionString = 'postgres://' + pgUsername + ':' + pgPassword + '@' + pgHostname + ':' + pgPort.toString() + '/' + pgDBName;
var port = process.env.PORT || config.port;

// Api import
var signupUser = require('./api/signup');
var signinUser = require('./api/signin');
var roomList = require('./api/roomlist');
var topicList = require('./api/topiclist');

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

  // io.use(function(socket, next){
  //   logger.debug("Token: ", socket.handshake.query);
  //   if (socket.handshake.query.token == "bar") {
  //     logger.debug('valid token');
  //     return next();
  //   }
  //   logger.debug('invalid token');
  //   socket.disconnect('unauthenticated');
  //   delete socket;
  //   // next(new Error('Authentication error'));
  // });

  // Client connected
  io.on('connection', function (socket) {

    logger.debug('Client connected', socket.handshake.address);
    logger.debug('Socket ID:', socket.id);

    socket.authenticated = false;

    // Signup request api
    socket.on('signup_request', function(data){

      logger.debug('signup_request came', data);

      var username = data.username;
      var phone_number = data.phone_number;

      signupUser(client, username, phone_number, logger, function(token, error){
        done();
        socket.username = username;
        socket.token = token.token;
        socket.emit('signup_response', JSON.stringify(token));

        if(error===true){
          socket.disconnect('unauthorized');
        } else {
          socket.authenticated = true;
        }

      });
    });

    // Signin request api
    socket.on('signin_request', function(data){

      logger.debug('signin_request came', data);

      signinUser(client, data.token, logger, function(resp, error){
        done();
        socket.username = resp.username;
        socket.token = data.token;
        socket.emit('signin_response', JSON.stringify(resp));

        if(error===true){
          socket.disconnect('unauthorized');
        } else {
          socket.authenticated = true;
        }

      });

    });

    // Roomlist request api
    socket.on('roomlist_request', function() {

      logger.debug('roomlist_request came');

      if(socket.authenticated===false){
        socket.emit('roomlist_response', { 'status': 'fail', 'detail': 'not authenticated' });
        socket.disconnect('unauthorized');
      }

      if(socket.authenticated===true) {
        roomList(client, logger, function(roomlist){
          done();
          socket.emit('roomlist_response', JSON.stringify(roomlist));
        });
      }

    });

    // Topiclist request api
    socket.on('topiclist_request', function(data) {

      logger.debug('topiclist_request came');

      var roomId = data.room_id;

      if(socket.authenticated===false){
        socket.emit('topiclist_response', { 'status': 'fail', 'detail': 'not authenticated' });
        socket.disconnect('unauthorized');
      }

      if(socket.authenticated===true) {
        topicList(client, roomId, logger, function(topiclist){
          done();
          socket.emit('topiclist_response', JSON.stringify(topiclist));
        });
      }

    });

    // Topic create request api
    socket.on('topiccreate_request', function(data) {

      logger.debug('topiccreate_request came');

      var title = data.title;
      var body = data.body;
      var parent_room_id = data.parent_room;
      var owner = socket.username;
      var roomId = data.room_id;
      var attrs = data.attrs;

      if(socket.authenticated===false) {
        socket.emit('topiccreate_response', { 'status': 'fail', 'detail': 'not authenticated' });
        socket.disconnect('unauthorized');
      }

      if(socket.authenticated===true) {
        topicCreate(client, roomId, logger, function(resp, error){
          done();
          socket.emit('topiccreate_response', JSON.stringify(resp));
        });
      }

    });

    // Client disconnected 
    socket.on('disconnect', function(){
      logger.debug('Client disconnected', socket.id);
      logger.debug('Client username was', socket.username);
      logger.debug('Client token was', socket.token);
      delete socket;
    });

  });

});

server.listen(port, function () {
  logger.info('Server listening at port %d', port);
});
