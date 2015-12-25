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

// api import
var signupUser = require('./api/signup');
var authenticateUser = require('./api/authenticate');
var roomList = require('./api/roomlist');
var topicList = require('./api/topiclist');
var topicCreate = require('./api/topiccreate');
var topicDelete = require('./api/topicdelete');
var topicUnsubscribe = require('./api/topicunsubscribe');

// set log level from config
logger.level = config.log_level;

// db pool size
pg.defaults.poolSize = config.postgresql.pool_size;

// rest route
var router = express.Router();

router.post('/signup', function(req, res) {

  var username = req.body.username;
  var phone_number = req.body.phone_number;

  if(!username) {
    return res.json({ status: 'fail', detail: 'username not given' });
  }

  if(!phone_number) {
    return res.json({ status: 'fail', detail: 'phone_number not given' });
  }

  pg.connect(pgConnectionString, function(err, client, done) {

    signupUser(client, username, phone_number, logger, function(token) {
      logger.debug('Got token from API', token);
      logger.info('User', username, 'signed up');
      logger.info('Token', token);
      return res.json(token);
    });

    // res.json({ status: 'ok' });

  });
});

app.use('/api', router);

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
    socket.on('signin_request', function(data) {

      // if no token given
      try {
        var token = data.token;
      } catch (err) {
        logger.error('No token given for authentication', socket.id);
        return socket.emit('signin_response', {status: 'fail', detail: 'token not given'});
      }

      logger.debug('Token ' + token + ' received from socket', socket.id);
      authenticateUser(client, token, logger, function(user) {
        if(user && 'id' in user) {
          socket.auth = true;
          socket.user_id = user.id;
          logger.info('User ' + socket.user_id + ' authenticated');
          socket.emit('signin_response', {status: 'ok'});
        } else {
          logger.error('Invalid token', token);
          socket.emit('signing_response', {status: 'fail', detail: 'invalid token'});
        }
      });

    });

    // if not authenticated kick it away after 1 sec
    setTimeout(function() {
      if(!socket.auth) {
        logger.error('Socket authentication timeout', socket.id);
        socket.disconnect();
      }
    }, 60000);


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

    // topic delete api
    socket.on('topicdelete_request', function(data) {

      // if socket not authenticated
      if(!socket.auth) {
        return socket.emit('topicdelete_response', {'status': 'fail', 'detail': 'not authenticated'});
      }

      logger.info('User ' + socket.user_id + ' asks for topic delete');

      // if topic title not given
      try {
        var topic_id = data.title;
      } catch (err) {
        logger.error('Parameters not fully given for topicdelete api', socket.id);
        return socket.emit('topicdelete_response', {status: 'fail', detail: 'topic_id not given'});
      }

      var owner = socket.user_id;

      // send topic delete result to user
      topicDelete(client, topic_id, owner, logger, function(resp){

        logger.debug('Sending ->', resp);
        socket.emit('topicdelete_response', resp);

        // Broadcast topic event to all including this socket
        io.emit('topic_events', {'event_type': 'deleted', 'object': resp});
      });

    });

    client.query('LISTEN topic_event', function(err, result) {
      logger.info("Listen started for topic_event");
    });

    // Topic created events
    client.on('notification', function(data) {
      logger.info('DB event fired', data);
      socket.emit('topic_events', data.payload);
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
