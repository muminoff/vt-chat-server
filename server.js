// main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var pg = require('pg');
var redis = require('redis');

// turn on the radar to catch errors
var raven = require('raven');
var radar = new raven.Client('http://a1a4f603b98f4313a25de7b016167a13:c5051fd9d959468892ea03bb0c724f66@sentry.drivers.uz/2');
radar.patchGlobal();

// async, raging ocean waves
var async = require('async');

// logger and config
var logger = require('./logger');
var config = require('./utils/config');

// set log level from config
logger.level = config.log_level;

// db pool size
pg.defaults.poolSize = 100;
pg.defaults.poolIdleTimeout = 10000;

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
var redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
});
redisClient.on('error', function(err) {
  logger.error('Cannot connect to Redis');
  process.exit(-1);
});

redisClient.select(config.redis.db);
if(config.redis.auth)redisClient.auth(config.redis.auth);

redisClient.on('connect', function() {
  logger.info('Connected to Redis');
});

// api import
var signinUser = require('./api/signin');
var userTopics = require('./api/usertopics');
var messageSave = require('./api/messagesave');
var topicUnsubscribe = require('./api/topicunsubscribe');


logger.info('Connected to PostgreSQL');

var onlineSockets = [];

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

    // get connection from pool
    pg.connect(pgConnectionString, function(err, client, done) {
    
      // on database connection failure
      if(err){
        logger.error('Cannot connect to PostgreSQL');
        logger.error(err);
        done();
        process.exit(-1);
      }

      signinUser(client, token, logger, function(user) {

        done();

        if(user && 'id' in user) {
          socket.auth = true;
          socket.user_id = user.id;
          socket.username = user.username;
          socket.gcm_token = user.gcm_token;
          socket.device_type = user.device_type;

          logger.info('User ' + socket.user_id + ' authenticated');
          socket.emit('signin_response', {status: 'ok'});
          onlineSockets.push(socket);

          logger.debug('Getting subscribed topics of user', socket.username, '...');

          userTopics(client, socket.user_id, logger, function(topics) {
            logger.info('Got response from API', topics);
            for (var i = 0; i < topics.length; i++) {
              
              // get topic id
              var topicid = topics[i].topic_id;
              var topic_keyspace = 'topic' + topicid;

              // join user to topic
              socket.join('topic' + topicid);
              logger.debug('User', socket.username, 'has now joined to topic', topicid);
              logger.debug('Removing offline mode in GCM worker keyspace', topic_keyspace);
              if(socket.device_type !== 'linux')redisClient.srem(topic_keyspace, socket.gcm_token);
            }
          });

        } else {
          logger.error('Invalid token', token);
          socket.emit('signin_response', {status: 'fail', detail: 'invalid token'});
        }

      });

    }); 

  });

  // if not authenticated kick it away after 1 sec
  setTimeout(function() {
    if(!socket.auth) {
      logger.error('Socket authentication timeout', socket.id);
      logger.debug('Getting subscribed topics of user', socket.username, '...');

    // get connection from pool
    pg.connect(pgConnectionString, function(err, client, done) {
    
      // on database connection failure
      if(err){
        logger.error('Cannot connect to PostgreSQL');
        logger.error(err);
        done();
        process.exit(-1);
      }

      userTopics(client, socket.user_id, logger, function(topics) {

        done();

        logger.info('Got response from API', topics);

        for (var i = 0; i < topics.length; i++) {

          // get topic id
          var topicid = topics[i].topic_id;
          var topic_keyspace = 'topic' + topicid;

          // socket.leave('topic' + topicid);
          logger.debug('Adding offline mode in GCM worker keyspace', topic_keyspace);
          if(socket.device_type !== 'linux')redisClient.sadd(topic_keyspace, socket.gcm_token);
        }
      });

      socket.disconnect();

      });
    }
  }, 1000);

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

    if(typeof(data.is_media) === 'undefined') {
      var is_media = null;
    } else {
      var is_media = data.is_media;
    }

    if(typeof(data.media_type) === 'undefined') {
      var media_type = null;
    } else {
      var media_type = data.media_type;
    }


    if(typeof(data.media_path) === 'undefined') {
      var media_path = null;
    } else {
      var media_path = data.media_path;
    }

    logger.info('Message came from topic', topic_id, 'with data', data);
    logger.debug('Saving message to DB');

    // get connection from pool
    pg.connect(pgConnectionString, function(err, client, done) {

      // on database connection failure
      if(err){
        logger.error('Cannot connect to PostgreSQL');
        logger.error(err);
        done();
        process.exit(-1);
      }

      messageSave(client, stamp_id, topic_id, socket.user_id, reply_to, body, attrs, is_media, media_type, media_path, logger, function(msg) {
        done();
        logger.debug('Got msg from API', msg);
        logger.debug('Broadcasting message through topic', topic_id);
        io.sockets.in('topic' + topic_id).emit('topic_message', msg);
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

    // get connection from pool
    pg.connect(pgConnectionString, function(err, client, done) {

      // on database connection failure
      if(err){
        logger.error('Cannot connect to PostgreSQL');
        logger.error(err);
        done();
        process.exit(-1);
      }

      // unsubscribe user from topic and send response
      topicUnsubscribe(client, socket.user_id, topic_id, logger, function(success){

        done();

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

  });

  // typing indicator api
  socket.on('typing_event', function(data) {

    // if socket not authenticated
    if(!socket.auth) {
      socket.emit('topicunsubscribe_response', {'status': 'fail', 'detail': 'not-authenticated'});
      socket.disconnect();
      return;
    }

    logger.info('User ' + socket.username + ' informs typing_event');

    // if topic id not given
    if(typeof(data.topic_id) === 'undefined') {
      socket.emit('typing_event', {status: 'fail', detail: 'topic_id not given'});
    }

    var topic_id = data.topic_id;
    io.sockets.in('topic' + topic_id).emit('typing_event', { topic: topic_id, user: socket.user_id });

  });

  // Client disconnected 
  socket.on('disconnect', function(){

    // get connection from pool
    pg.connect(pgConnectionString, function(err, client, done) {
    
      // on database connection failure
      if(err){
        logger.error('Cannot connect to PostgreSQL');
        logger.error(err);
        done();
        process.exit(-1);
      }

      userTopics(client, socket.user_id, logger, function(topics) {

        done();

        logger.info('Got response from API', topics);

        for (var i = 0; i < topics.length; i++) {

          // get topic id
          var topicid = topics[i].topic_id;
          var topic_keyspace = 'topic' + topicid;

          // socket.leave('topic' + topicid);
          logger.debug('Adding offline mode in GCM worker keyspace', topic_keyspace);
          if(socket.device_type !== 'linux')redisClient.sadd(topic_keyspace, socket.gcm_token);
        }
      });

      socket.disconnect();

    });

    logger.info('Client disconnected', socket.id);
    if(typeof(socket.user_id) !== 'undefined') {
      logger.info('Client user_id was', socket.user_id);
      logger.info('Client username was', socket.username);
    }
    delete socket;
  });

}); // io connection end

var pgClient = new pg.Client(pgConnectionString);
pgClient.connect(function(err) {

  // on database connection failure
  if(err){
    logger.error('Cannot connect to PostgreSQL');
    logger.error(err);
    process.exit(-1);
  }

  pgClient.query('LISTEN topic_events', function(err, result) {
    if(err)logger.error('Cannot listen to topic_events');
    logger.info('Listener started for topic_events');
  });

  pgClient.on('notification', function(data) {
    switch (data.channel) {
    case 'topic_events':
      logger.info('New topic event fired, pid %d', data.processId);
      var topic_data = JSON.parse(data.payload);
      logger.debug('trigger sent ->', JSON.stringify(topic_data));
      joinOnlineSockets(topic_data.data.id);
      io.emit('topic_events', topic_data);
      break;
    default:
      logger.warn('Some event fired in DB');
    }
  });

});

function joinOnlineSockets(topic_id) {
  logger.debug('Going to join sockets into topic', topic_id);
  io.of('/').clients(function(error, clients) {
    if (error) throw error;
    logger.debug('=clients=>', clients);
    clients.forEach(function(s) {
      logger.debug('Joining', s, 'to', topic_id);
      io.of('/').sockets[s].join('topic'+topic_id);
    });
  });
};

server.listen(port, host, function () {
  logger.info('Server listening at %s:%d', host, port);
});
