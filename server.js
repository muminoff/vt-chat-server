// Main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var pg = require('pg');
pg.defaults.poolSize = 200;

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

// Api
var signupUser = require('./api/signup');
var signinUser = require('./api/signin');
var roomList = require('./api/roomlist');
var topicList = require('./api/topiclist');
var topicCreate = require('./api/topiccreate');
var subscribedTopics = require('./api/subscribedtopics');

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
  io.sockets.on('connection', function (socket) {

    logger.debug('Client connected', socket.handshake.address);
    logger.debug('Socket ID:', socket.id);

    // Signup request api
    socket.on('signup_request', function(data){

      logger.debug('signup_request came', data);

      var username = data.username;
      var phone_number = data.phone_number;

      signupUser(client, username, phone_number, logger, function(token){

        socket.username = username;
        socket.token = token.token;
        logger.debug('Sending ->', token);
        socket.emit('signup_response', token);
        logger.debug('Getting subscribed rooms for user', socket.username);

      });

    });

    // Signin request api
    socket.on('signin_request', function(data){

      logger.debug('signin_request came', data);

      signinUser(client, data.token, logger, function(resp){
        logger.debug('Got response from api', resp);
        logger.debug('This is username from api', resp.username);
        logger.debug('This is token from request', data.token);
        socket.username = resp.username;
        socket.token = data.token;
        logger.debug('Sending ->', resp);
        socket.emit('signin_response', resp);

      });

    });

    // Roomlist request api
    socket.on('roomlist_request', function() {

      logger.debug('roomlist_request came');

      roomList(client, logger, function(roomlist){
        logger.debug('Sending ->', roomlist);
        socket.emit('roomlist_response', roomlist);
      });

    });

    // Topiclist request api
    socket.on('topiclist_request', function(data) {

      logger.debug('topiclist_request came');

      var room_id = data.room_id;

      topicList(client, room_id, logger, function(topiclist){
        logger.debug('Sending ->', topiclist);
        socket.emit('topiclist_response', topiclist);
      });

    });

    // Topic create request api
    socket.on('topiccreate_request', function(data) {

      logger.debug('topiccreate_request came', data);

      var title = data.title;
      var body = data.body;
      var parent_room = data.parent_room;
      var owner = socket.username;
      logger.debug('owner ----->', owner);
      var attrs = data.attrs;

      topicCreate(client, title, body, parent_room, owner, attrs, logger, function(resp){

        logger.debug('Sending ->', resp);
        socket.emit('topiccreate_response', resp);

        // Broadcast topic event to all including this socket
        io.emit('topic_events', {'event_type': 'created', 'object': resp});
      });

    });

    // Message send api
    socket.on('messagesend_request', function(data) {

      logger.debug('messagesend_request came', data);

      var topic_id = data.topic_id;
      var sender = socket.username;
      var reply_to = data.reply_to;
      var body = data.body;
      var attrs = data.attrs;

      logger.debug('sender ----->', sender);

      messageSend(client, topic_id, sender, reply_to, body, attrs, logger, function(resp){

        logger.debug('Sending ->', resp);
        socket.emit('messagesend_response', resp);

        // Broadcast topic event to all including this socket
        io.emit('message_events', {'event_type': 'created', 'object': resp});
      });

    });

    // Client disconnected 
    socket.on('disconnect', function(){
      logger.debug('Client disconnected', socket.id);
      logger.debug('Client username was', socket.username);
      logger.debug('Client token was', socket.token);
      delete socket;
      logger.debug('Socket destroyed', socket.id);
    });

  });

});

var topicEventChannel = io.of('/topic_events').use(function(socket, next){
  logger.debug("Authenticating new socket connection to /topic_events ...")
  next();
}); 

topicEventChannel.on('connection', function(socket){
  console.log("Socket " + socket.id + " now connected to namespace /topic_events");
})

server.listen(port, function () {
  logger.info('Server listening at port %d', port);
});
