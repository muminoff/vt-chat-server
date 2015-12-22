// main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var pg = require('pg');

// logger and config
var logger = require('./logger');
var config = require('./utils/config');

// variables
var pgUsername = config.postgresql.user;
var pgPassword = config.postgresql.pass;
var pgHostname = config.postgresql.host;
var pgPort = config.postgresql.port;
var pgDBName = config.postgresql.name;
var pgConnectionString = 'postgres://' + pgUsername + ':' + pgPassword + '@' + pgHostname + ':' + pgPort.toString() + '/' + pgDBName;

// rest api stuff
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || config.port;

// rest route
var router = express.Router();
router.get('/', function(req, res) {
  res.json({ status: 'ok' });
});
app.use('/api', router);

// api import
var authenticateUser = require('./api/authenticate');
var roomList = require('./api/roomlist');
var topicList = require('./api/topiclist');
var topicCreate = require('./api/topiccreate');

// set log level from config
logger.level = config.log_level;

// db pool size
pg.defaults.poolSize = config.postgresql.pool_size;

// initialize DB with client pool
pg.connect(pgConnectionString, function(err, client, done) {

  // on database connection failure
  if(err){
    logger.error('Cannot connect to DB');
    logger.error(err);
    process.exit(-1);
  }

  logger.info('Connected to DB');

  // on socket connection
  io.sockets.on('connection', function (socket) {

    socket.auth = false;

    logger.debug('Socket connected', socket.id);
    logger.debug('Socket address:', socket.handshake.address);

    // on authentication
    socket.on('authenticate', function(data) {

      // if no token given
      try {
        var token = data.token;
      } catch (err) {
        logger.error('No token given for authentication', socket.id);
        return socket.emit('authenticate', {status: 'fail', detail: 'token not given'});
      }

      logger.debug('Token ' + token + ' received from socket', socket.id);
      authenticateUser(client, token, logger, function(user) {
        if(user && 'id' in user) {
          socket.auth = true;
          socket.user_id = user.id;
          logger.info('User ' + socket.user_id + ' authenticated');
          socket.emit('authenticate', {status: 'ok'});
        } else {
          logger.error('Invalid token', token);
          socket.emit('authenticate', {status: 'fail', detail: 'invalid token'});
        }
      });

    });

    // if not authenticated kick it away after 1 sec
    setTimeout(function() {
      if(!socket.auth) {
        logger.error('Socket authentication timeout', socket.id);
        socket.disconnect();
      }
    }, 1000);


    // roomlist api
    socket.on('roomlist_request', function() {

      // if socket not authenticated
      if(!socket.auth) {
        logger.error('Not authenticated socket', socket.id);
        return socket.emit('roomlist_response', {status: 'fail', detail: 'not authenticated'});
      }

      logger.info('User ' + socket.user_id + ' asks for room list');

      roomList(client, logger, function(roomlist){
        logger.info('Sending room list to ' + socket.user_id);
        logger.debug('Sending data ' + JSON.stringify(roomlist));
        socket.emit('roomlist_response', { status: 'ok', data: roomlist });
      });

    });

    // Topiclist api
    socket.on('topiclist_request', function(data) {

      // if socket not authenticated
      if(!socket.auth) {
        logger.error('Not authenticated socket', socket.id);
        return socket.emit('roomlist_response', {status: 'fail', detail: 'not authenticated'});
      }

      logger.debug('User ' + socket.user_id + ' asks for topic list');

      // if room id not given
      try {
        var room_id = data.room_id;
      } catch (err) {
        logger.error('No room id given for topiclist api', socket.id);
        return socket.emit('topiclist_response', {status: 'fail', detail: 'room_id not given'});
      }

      // send room list
      topicList(client, room_id, logger, function(topiclist){
        logger.info('Sending topic list to ' + socket.user_id);
        logger.debug('Sending data ' + JSON.stringify(topiclist));
        socket.emit('topiclist_response', { status: 'ok', data: topiclist });
      });

    });

    // topic create api
    socket.on('topiccreate_request', function(data) {

      // if socket not authenticated
      if(!socket.auth) {
        return socket.emit('topiccreate_response', {'status': 'fail', 'detail': 'not authenticated'});
      }

      logger.info('User ' + socket.user_id + ' asks for topic create');

      // if topic title not given
      try {
        var title = data.title;
        var body = data.body;
        var parent_room = data.parent_room;
        var attrs = data.attrs;
      } catch (err) {
        logger.error('Parameters not fully given for topiccreate api', socket.id);
        return socket.emit('topiccreate_response', {status: 'fail', detail: 'parameters not fully given, check api docs'});
      }

      var owner = socket.user_id;

      // send topic create result to user
      topicCreate(client, title, body, parent_room, owner, attrs, logger, function(resp){

        logger.debug('Sending ->', resp);
        socket.emit('topiccreate_response', resp);

        // Broadcast topic event to all including this socket
        io.emit('topic_events', {'event_type': 'created', 'object': resp});
      });

    });

    // Client disconnected 
    socket.on('disconnect', function(){
      logger.info('Client disconnected', socket.id);
      logger.info('Client user_id was', socket.user_id);
      delete socket;
      logger.warn('Socket destroyed', socket.id);
    });

  });

});

server.listen(port, function () {
  logger.info('Server listening at port %d', port);
});
