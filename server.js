// Main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
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

// Express stuff
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || config.port;

// REST route
var router = express.Router();
router.get('/', function(req, res) {
  res.json({ status: 'ok' });
});
app.use('/api', router);

// Api
var authenticate = require('./api/authenticate');
// var roomList = require('./api/roomlist');
// var topicList = require('./api/topiclist');
// var topicCreate = require('./api/topiccreate');
// var subscribedTopics = require('./api/subscribedtopics');

// Set log level from config
logger.level = config.log_level;

// DB pool size
pg.defaults.poolSize = config.postgresql.pool_size;

// Initialize DB with client pool
pg.connect(pgConnectionString, function(err, client, done) {

  // On database connection failure
  if(err){
    logger.error('Cannot connect to DB');
    logger.error(err);
    process.exit(-1);
  }

  logger.info('Connected to DB');

  // Client connected
  io.sockets.on('connection', function (socket) {

    logger.debug('Client connected', socket.handshake.address);
    logger.debug('Socket ID:', socket.id);
    socket.auth = false;

    // Authentication
    socket.on('authenticate', function(data) {

      try {
        var token = data.token;
      } catch (err) {
        return socket.emit('authenticate', {status: 'fail', detail: 'token not given'});
      }

      logger.debug('Token received: ', token);
      authenticate(client, token, logger, function(user) {
        if(user && 'id' in user) {
          socket.auth = true;
          socket.user_id = user.id;
          socket.username = user.username;
          logger.debug('User ' + socket.username + ' authenticated');
          socket.emit('authenticate', {status: 'ok'});
        } else {
          logger.debug('Invalid token', token);
          socket.emit('authenticate', {status: 'fail', detail: 'invalid token'});
        }
      });

    });

    setTimeout(function() {
      if(!socket.auth) {
        logger.debug('Authentication timeout and disconnecting socket', socket.id, '...');
        socket.disconnect();
      }
    }, 1000);


    // // Roomlist request api
    // socket.on('roomlist_request', function() {

    //   if(!socket.auth) {
    //     return socket.emit('roomlist_response', {'status': 'fail', 'detail': 'not authenticated'});
    //   }

    //   logger.debug('roomlist_request came');

    //   roomList(client, logger, function(roomlist){
    //     logger.debug('Sending ->', roomlist);
    //     socket.emit('roomlist_response', roomlist);
    //   });

    // });

    // // Topiclist request api
    // socket.on('topiclist_request', function(data) {

    //   if(!socket.auth) {
    //     return socket.emit('topiclist_response', {'status': 'fail', 'detail': 'not authenticated'});
    //   }

    //   logger.debug('topiclist_request came');

    //   var room_id = data.room_id;

    //   topicList(client, room_id, logger, function(topiclist){
    //     logger.debug('Sending ->', topiclist);
    //     socket.emit('topiclist_response', topiclist);
    //   });

    // });

    // // Topic create request api
    // socket.on('topiccreate_request', function(data) {

    //   if(!socket.auth) {
    //     return socket.emit('topiccreate_response', {'status': 'fail', 'detail': 'not authenticated'});
    //   }

    //   logger.debug('topiccreate_request came', data);

    //   var title = data.title;
    //   var body = data.body;
    //   var parent_room = data.parent_room;
    //   var owner = socket.username;
    //   logger.debug('owner ----->', owner);
    //   var attrs = data.attrs;

    //   topicCreate(client, title, body, parent_room, owner, attrs, logger, function(resp){

    //     logger.debug('Sending ->', resp);
    //     socket.emit('topiccreate_response', resp);

    //     // Broadcast topic event to all including this socket
    //     io.emit('topic_events', {'event_type': 'created', 'object': resp});
    //   });

    // });

    // // Message send api
    // socket.on('messagesend_request', function(data) {

    //   if(!socket.auth) {
    //     return socket.emit('messagesend_response', {'status': 'fail', 'detail': 'not authenticated'});
    //   }

    //   logger.debug('messagesend_request came', data);

    //   var topic_id = data.topic_id;
    //   var sender = socket.username;
    //   var reply_to = data.reply_to;
    //   var body = data.body;
    //   var attrs = data.attrs;

    //   logger.debug('sender ----->', sender);

    //   messageSend(client, topic_id, sender, reply_to, body, attrs, logger, function(resp){

    //     logger.debug('Sending ->', resp);
    //     socket.emit('messagesend_response', resp);

    //     // Broadcast topic event to all including this socket
    //     io.emit('message_events', {'event_type': 'created', 'object': resp});
    //   });

    // });

    // Client disconnected 
    socket.on('disconnect', function(){
      logger.debug('Client disconnected', socket.id);
      logger.debug('Client username was', socket.username);
      logger.debug('User ID was', socket.user_id);
      delete socket;
      logger.debug('Socket destroyed', socket.id);
    });

  });

});

server.listen(port, function () {
  logger.info('Server listening at port %d', port);
});
