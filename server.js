// main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var pg = require('pg');
var redis = require('redis');
var hau = require('hau');

// turn on the radar to catch errors
var raven = require('raven');
var radar = new raven.Client('http://a1a4f603b98f4313a25de7b016167a13:c5051fd9d959468892ea03bb0c724f66@sentry.drivers.uz/2');
radar.patchGlobal();

// async, raging ocean waves
var async = require('async');

// logger and config
var logger = require('./logger');
var config = require('./lib/config');

// set log level from config
logger.level = config.log_level;

// db pool size
pg.defaults.poolSize = 100;
pg.defaults.poolIdleTimeout = 100;

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

// redis authentication
redisClient.select(config.redis.db);
if(config.redis.auth)redisClient.auth(config.redis.auth);

// user analytics
var activity = hau.createClient(config.redis.port, config.redis.host);

// api import
var signinUser = require('./lib/signin');
var allTopics = require('./lib/alltopics');
var userTopics = require('./lib/usertopics');
var messageSave = require('./lib/messagesave');
var mat = require('./lib/mat');

// sockets
var online_sockets = [];

// on socket connection
io.sockets.on('connection', function (socket) {

  // socket is not authenticated by default
  socket.auth = false;

  // get client real ip address
  remote_addr = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

  logger.debug('Socket connected', socket.id);
  logger.debug('Socket address:', remote_addr);

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
          socket.roles = user.roles;

          logger.info('User ' + socket.user_id + ' authenticated');
          logger.info('User roles ->', socket.roles);
          socket.emit('signin_response', { status: 'ok', roles: user.roles });
          online_sockets.push(socket);
          activity.track(socket.user_id, 'signed_in');

          logger.debug('Getting subscribed topics of user', socket.username, '...');

          userTopics(client, socket.user_id, logger, function(topics) {
            logger.info('Got topics from API', topics);
            for (var i = 0; i < topics.length; i++) {
              
              // get topic id
              var topicid = topics[i].topic_id;
              var topic_keyspace = 'topic' + topicid;

              // join user to topic
              socket.join(topic_keyspace);
              logger.debug('User', socket.username, 'has now joined to topic', topic_keyspace);
              logger.debug('Removing offline mode in GCM worker keyspace', topic_keyspace);
              if(socket.device_type !== 'linux')redisClient.srem(topic_keyspace, socket.gcm_token);
            }
          });

          if((socket.roles!==null) && (socket.roles.robot===true)) {
            logger.debug("Joinning robot", socket.username, "to all topics ...");
            allTopics(client, logger, function(topics) {
              logger.info("Got all topics from DB");
              for(var i=0; i<topics.length; i++) {
                var topicid = topics[i].id;
                var topic_keyspace = 'topic' + topicid;
                socket.join(topic_keyspace);
                logger.debug("Robot", socket.username, "has now joined to topic", topic_keyspace);
              }
            });
          }

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
      socket.disconnect();
    }
  }, 3000);

  // topic message api
  socket.on('message_events', function(data) {

    // if socket not authenticated
    if(!socket.auth) {
      socket.emit('message_events', {'status': 'fail', 'detail': 'not-authenticated'});
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

    if(typeof(data.has_media) === 'undefined') {
      var has_media = false;
    } else {
      var has_media = data.has_media;
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

      if((socket.roles!==null) && (socket.roles.robot===true)) {
        var body_filtered = body;
      } else {
        var body_filtered = mat.filter(body);
      }

      messageSave(client, stamp_id, topic_id, socket.user_id, reply_to, body_filtered, attrs, has_media, logger, function(msg) {
        done();
        logger.debug('Got msg from API', msg);
        logger.debug('Broadcasting message through topic', topic_id);
        io.sockets.in('topic' + topic_id).emit('message_events', msg);
        activity.track(socket.user_id, 'sent_message');
      });

    });

  });

  // typing indicator api
  socket.on('typing_event', function(data) {

    // if socket not authenticated
    if(!socket.auth) {
      socket.emit('typing_event', {'status': 'fail', 'detail': 'not-authenticated'});
      socket.disconnect();
      return;
    }

    logger.info('User ' + socket.username + ' informs typing_event');

    // if topic id not given
    if(typeof(data.topic_id) === 'undefined') {
      socket.emit('typing_event', {status: 'fail', detail: 'topic_id not given'});
    }

    if(typeof(data.username) === 'undefined') {
      socket.emit('typing_event', {status: 'fail', detail: 'username not given'});
    }
    var topic_id = data.topic_id;
    io.sockets.in('topic' + topic_id).emit('typing_event', data);

  });

  // Client disconnected 
  socket.on('disconnect', function(){
    online_sockets.splice(online_sockets.indexOf(socket), 1);

    logger.info('Client disconnected', socket.id);
    if(typeof(socket.user_id) !== 'undefined') {
      logger.info('Client user_id was', socket.user_id);
      logger.info('Client username was', socket.username);
    }
    delete socket;

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

        logger.info('Got topics from API', topics);

        for (var i = 0; i < topics.length; i++) {

          // get topic id
          var topicid = topics[i].topic_id;
          var topic_keyspace = 'topic' + topicid;

          // socket.leave('topic' + topicid);
          logger.debug('Adding offline mode in GCM worker keyspace', topic_keyspace);
          if(socket.device_type !== 'linux')redisClient.sadd(topic_keyspace, socket.gcm_token);
        }
      });


    });
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

  pgClient.query('LISTEN message_events', function(err, result) {
    if(err)logger.error('Cannot listen to message_events');
    logger.info('Listener started for message_events');
  });

  pgClient.on('notification', function(data) {
    switch (data.channel) {
      case 'topic_events':
        logger.info('New topic event fired, pid %d', data.processId);
        var topic_data = JSON.parse(data.payload);
        logger.debug('trigger sent ->', JSON.stringify(topic_data));
        detectEvent(topic_data.event_type, topic_data.data);
        io.emit('topic_events', topic_data);
        break;
      case 'message_events':
        logger.info('New message event fired, pid %d', data.processId);
        var message_data = JSON.parse(data.payload);
        logger.debug('trigger sent ->', JSON.stringify(message_data));
        detectEvent(message_data.event_type, message_data.data);
        io.emit('message_events', message_data);
        break;
      default:
        logger.warn('Some event fired in DB');
    }
  });

});

function detectEvent(event_type, data) {
  logger.debug('Event detected', event_type);
  logger.debug('Sockets ->', online_sockets.length);
  switch (event_type) {
    case 'joined': 
      logger.debug('User', data.user.username, 'joined topic', data.id);
      online_sockets.forEach(function(s) {
        if(parseInt(s.user_id)===data.user.id) {
          logger.debug(data.user.username, 'found in local socket, joining to topic', data.id, '...');
          s.join('topic' + data.id);
        }
      });
      break;
    case 'left':
      logger.debug('User', data.user.username, 'left topic', data.id);
      online_sockets.forEach(function(s) {
        if(parseInt(s.user_id)===data.user.id) {
          logger.debug(data.user.username, 'found in local socket, leaving topic', data.id, '...');
          s.leave('topic' + data.id);
        }
      });
      break;
    default:
      logger.warn('Other event fired in DB');
  }
}

// listen on given host and port
server.listen(port, host, function () {
  logger.info('Server listening at %s:%d', host, port);
});
