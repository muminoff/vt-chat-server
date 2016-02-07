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

socket.on('connect', function(){
  console.log('Connected to socket.io server');
  socket.emit('signin_request', {'token': '53415178f317452eb244df678722fc10'});

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
          logger.info('New message event fired');
          logger.info(data.payload);
          break;
        case 'topic_events':
          logger.info('New topic event fired');
          logger.info(data.payload);
          var topic_data = JSON.parse(data.payload);
          logger.debug('Trigger received ->', JSON.stringify(topic_data));
          detectTopicEvent(topic_data.event_type, topic_data.data);
          break;
        default:
          logger.warn('Some event fired in DB');
      }
    });

  });

});

function detectTopicEvent(event_type, data) {
  logger.debug('Topic detected', event_type);
  switch (event_type) {
    case 'joined': 
      logger.debug('User', data.user.username, 'joined topic', data.id);
      break;
    case 'left':
      logger.debug('User', data.user.username, 'left topic', data.id);
      break;
    default:
      logger.warn('Other event fired in DB');
  }
}

socket.on('signin_response', function(data){
  logger.debug("Authentication ->", data);
});
