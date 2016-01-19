// main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var pg = require('pg');
// var redis = require('redis');

// funktionale programminghe stuffhe
// ay lob konkyurent kompyuting mazapaka
var __ = require('lazy.js');

// logger and config
var logger = require('./logger');
var config = require('./utils/config');

// set log level from config
logger.level = config.log_level;

// db pool size
pg.defaults.poolSize = config.postgresql.pool_size;

// variables
var pgUsername = config.postgresql.user;
var pgPassword = config.postgresql.pass;
var pgHostname = config.postgresql.host;
var pgPort = config.postgresql.port;
var pgDBName = config.postgresql.name;
var pgConnectionString = 
  'postgres://' + pgUsername + ':' + pgPassword + '@'+ pgHostname + ':' + pgPort.toString() + '/' + pgDBName;
var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;
var gcm_api_key = process.env.GCM_API_KEY || config.gcm_api_key;

// redis client instance
// var redisClient = redis.createClient({
//   host: config.redis.host,
//   port: config.redis.port,
// });
// redisClient.on('error', function(err) {
//   logger.error('Cannot connect to Redis');
//   process.exit(-1);
// });
// redisClient.select(config.redis.db);
// if(config.redis.auth)redisClient.auth(config.redis.auth);
// redisClient.on('connect', function() {
//   logger.info('Connected to Redis');
// });

// api import
var getAllTopics = require('./api/alltopics.js');
var signupUser = require('./api/signup');
var signinUser = require('./api/signin');
var userTopics = require('./api/usertopics');
var roomList = require('./api/roomlist');
var topicList = require('./api/topiclist');
var topicMembers = require('./api/topicmembers');
var topicCreate = require('./api/topiccreate');
var messageSave = require('./api/messagesave');
var topicUnsubscribe = require('./api/topicunsubscribe');
var sendGCMToTopic = require('./api/sendgcmtotopic');

// workers import
var gcmPushSender = require('./workers/gcmpushsender.js');

// initialize DB with client pool
pg.connect(pgConnectionString, function(err, client, done) {

  // on database connection failure
  if(err){
    logger.error('Cannot connect to PostgreSQL');
    logger.error(err);
    process.exit(-1);
  }

  logger.info('Connected to PostgreSQL');

  // get all topics
  // getAllTopics(client, logger, function(topics) {
  //  logger.info('Got all topics =>', JSON.stringify(topics));
  // });

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
      signinUser(client, token, logger, function(user) {

        if(user && 'id' in user) {
          socket.auth = true;
          socket.user_id = user.id;
          socket.username = user.username;
          logger.info('User ' + socket.user_id + ' authenticated');
          socket.emit('signin_response', {status: 'ok'});

          logger.debug('Getting subscribed topics of user', socket.username, '...');
          userTopics(client, socket.user_id, logger, function(topics) {
            logger.info('Got response from API', topics);
            for (var i = 0; i < topics.length; i++) {
              
              // get topic id
              var topicid = topics[i].topic_id;

              // join user to topic
              socket.join('topic' + topicid);
              logger.debug('User', socket.username, 'has now joined to topic', topicid);

              // remove user_id from offline users
              // redisClient.srem('topic' + topicid, socket.user_id);
            }
          });

        } else {
          logger.error('Invalid token', token);
          socket.emit('signin_response', {status: 'fail', detail: 'invalid token'});
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

    // topic message api
    socket.on('topic_message', function(data) {

      // if socket not authenticated
      if(!socket.auth) {
        socket.emit('topic_message', {'status': 'fail', 'detail': 'not-authenticated'});
        socket.disconnect();
        return;
      }

      if(typeof(data.stamp_id) === 'undefined') {
        var stamp_id = null;
      } else {
        var stamp_id = data.stamp_id;
      }

      var topic_id = data.topic_id;
      var body = data.body;

      if(typeof(data.reply_to) === 'undefined') {
        var reply_to = null;
      } else {
        var reply_to = data.reply_to;
      }

      if(typeof(data.attrs) === 'undefined') {
        var attrs = null;
      } else {
        var attrs = data.attrs;
      }

      logger.info('Message came from topic', topic_id, 'with data', data);
      logger.debug('Saving message to DB');

      messageSave(client, stamp_id, topic_id, socket.user_id, reply_to, body, attrs, logger, function(msg) {
        logger.debug('Got msg from API', msg);
        logger.debug('Broadcasting message through topic', topic_id);
        io.sockets.in('topic' + topic_id).emit('topic_message', msg);
        sendGCMToTopic(client, topic_id, logger, function() {
          logger.debug('Sent gcm');
        });
      });

    });

    // topic unsubscribe api
    socket.on('topicunsubscribe_request', function(data) {

      // if socket not authenticated
      if(!socket.auth) {
        socket.emit('topicunsubscribe_response', {'status': 'fail', 'detail': 'not-authenticated'});
        socket.disconnect();
        return;
      }

      logger.info('User ' + socket.user_id + ' asks for topic unsubscribe');

      // if topic id not given
      if(typeof(data.topic_id) === 'undefined') {
        socket.emit('topicunsubscribe_response', {status: 'fail', detail: 'topic_id not given'});
      }

      var topic_id = data.topic_id;

      // unsubscribe user from topic and send response
      topicUnsubscribe(client, socket.user_id, topic_id, logger, function(success){

        logger.debug('Sending ->', resp);

        if(success) {
          socket.emit('topicunsubscribe_response', { status: 'ok', topic_id: topic_id, user: { id: socket.user_id }});
        } else {
          socket.emit('topicunsubscribe_response', { status: 'fail' });
        }

        // Broadcast topic event to all including this socket
        io.emit('topic_events', { event_type: 'unsubscribed', topic_id: topic_id, user: { id: socket.user_id } });
      });

    });

    // Client disconnected 
    socket.on('disconnect', function(){
      logger.info('Client disconnected', socket.id);
      if(typeof(socket.user_id) !== 'undefined')
        logger.info('Client user_id was', socket.user_id);
      delete socket;
      logger.warn('Socket destroyed', socket.id);
    });

  });

  client.query('LISTEN message_events', function(err, result) {
    if(err)logger.error('Cannot listen to message_event');
    logger.info('Listener started for message_events');
  });

  client.query('LISTEN topic_events', function(err, result) {
    if(err)logger.error('Cannot listen to topic_events');
    logger.info('Listener started for topic_events');
  });

  client.on('notification', function(data) {
    switch (data.channel) {
    case 'topic_events':
      logger.info('New topic event fired, pid %d', data.processId);
      var topic_data = JSON.parse(data.payload);
      logger.debug(topic_data);
      var socket_ids = Object.keys(io.engine.clients);
      logger.debug("Socket IDs =>", socket_ids);
      socket_ids.forEach(function(socketid) {
        var currentSocket = io.of('/').connected[socketid];
        var currentUserID = currentSocket.user_id;
        var currentUsername = currentSocket.username;
        logger.debug("Handling socket", currentSocket.id, "to join topic", topic_data.id);
        logger.debug("User ID:", currentUserID);
        logger.debug("Username:", currentUsername);
        io.of('/').connected[socketid].join("topic" + topic_data.id);
      });
      io.emit('topic_events', {event_type: 'created', data: topic_data});
      // TODO:
      // broadcast data.payload to offline users via gcm push
      break;
    case 'message_events':
      logger.info('New message event fired, pid %d', data.processId);
      break;
    default:
      logger.warn('Some event fired in DB');
    }
  });

});

server.listen(port, host, function () {
  logger.info('Server listening at %s:%d', host, port);
});
