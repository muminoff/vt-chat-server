// socket.io client
var socket = require('socket.io-client')('https://chat.drivers.uz');

// main modules
var pg = require('pg');

// async, raging ocean waves
var async = require('async');

// lodash
var _ = require('lodash');

// logger and config
var logger = require('../logger');
var config = require('../lib/config');

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
var pgClient = new pg.Client(pgConnectionString);
var robotToken = process.env.ROBOT_TOKEN || config.robot_token;

socket.on('connect', function(){
  console.log('Connected to socket.io server');
  socket.emit('signin_request', {'token': robotToken});

  pgClient.connect(function(err) {

    // on database connection failure
    if(err){
      logger.error('Cannot connect to PostgreSQL');
      logger.error(err);
      process.exit(-1);
    }

    logger.info('Connected to PostgreSQL');

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
        case 'message_events':
          logger.info('Message event fired');
          logger.debug(data.payload);
          break;
        case 'topic_events':
          logger.info('Topic event fired');
          logger.debug(data.payload);
          var topic_data = JSON.parse(data.payload);
          detectTopicEvent(socket, topic_data.event_type, topic_data.data);
          break;
        default:
          logger.warn('Some event fired');
      }
    });

  });

});

function detectTopicEvent(socket, event_type, data) {
  logger.debug('Topic event detected ->', event_type);
  switch (event_type) {
    case 'joined': 
      logger.debug('User', data.user.username, 'joined topic', data.id);
      var timestamp = new Date().getTime();
      var message = {
        stamp_id: data.user.username + ':' + timestamp.toString(),
        topic_id: data.id,
        body: data,
        reply_to: null,
        attrs: { robot_message: true },
        has_media: false
      };
      socket.emit(data.id, message);
      break;
    case 'left':
      logger.debug('User', data.user.username, 'left topic', data.id);
      break;
    default:
      logger.warn('Other event fired');
  }
}

socket.on('signin_response', function(data){
  logger.debug("Authentication ->", data);
});
