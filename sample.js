// main modules
var pg = require('pg');

// async, raging ocean waves
var async = require('async');

// lodash
var _ = require('lodash');

// logger and config
var logger = require('./logger');
var config = require('./lib/config');

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


// api import
var signinUser = require('./lib/signin');
var userTopics = require('./lib/usertopics');
var messageSave = require('./lib/messagesave');
var topicUnsubscribe = require('./lib/topicunsubscribe');


logger.info('Connected to PostgreSQL');

pg.connect(pgConnectionString, function(err, client, done) {

  // on database connection failure
  if(err){
    logger.error('Cannot connect to PostgreSQL');
    logger.error(err);
    done();
    process.exit(-1);
  }

  function get_topic_id(item) {
    return item.id;
  }

  userTopics(client, 1, logger, function(err, result) {
    var topic_ids = _.map(result, get_topic_id);
    logger.debug('topic ids ->', topic_ids);
  });

}); 
