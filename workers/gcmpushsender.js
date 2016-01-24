// redis client
var redis = require('redis');

// gcm client
var gcm = require('node-gcm');

// pg client
var pg = require('pg').native;

// get main config
var config = require('../utils/config');

// set logger
var logger = require('../logger');
logger.level = config.log_level;

// turn on the radar to catch errors
var raven = require('raven');
var radar = new raven.Client('http://3f228dbaa0824fbda9ce48af61ac0147:66b1b4df0d344db58cefc852103d05e7@sentry.drivers.uz/4');
radar.patchGlobal();

// db pool size
// pg.defaults.poolSize = config.postgresql.pool_size;

// variables
var pgUsername = config.postgresql.user;
var pgPassword = config.postgresql.pass;
var pgHostname = config.postgresql.host;
var pgPort = config.postgresql.port;
var pgDBName = config.postgresql.name;
var pgConnectionString = 
  'postgres://' + pgUsername + ':' + pgPassword + '@'+ pgHostname + ':' + pgPort.toString() + '/' + pgDBName;
var gcm_api_key = process.env.GCM_API_KEY || config.gcm_api_key;

// redis client instance
var redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
});

// log error on connection failure
redisClient.on('error', function(err) {
  logger.error('Cannot connect to Redis');
  process.exit(-1);
});

// select redis db
redisClient.select(config.redis.db);

// if auth set, authenticate redis client
if(config.redis.auth)redisClient.auth(config.redis.auth);

// log it if connection succeeds
redisClient.on('connection', function() {
  logger.info('Connected to Redis');
});

var pgClient = new pg.Client(pgConnectionString);
pgClient.connect(function(err) {

  // on database connection failure
  if(err){
    logger.error('Cannot connect to PostgreSQL');
    logger.error(err);
    process.exit(-1);
  }

  logger.info('Connected to PostgreSQL');

  pgClient.query("select s.topic_id, array_agg(u.gcm_token) as tokens from subscribers s right join users u on u.id=s.user_id where not u.device_type='linux' group by s.topic_id", function(err, result) {
    if(err)logger.error('Cannot get gcm_tokens', err);

    result.rows.forEach(function(row) {
      logger.debug('Got all offline gcm_tokens');
      redisClient.del('topic' + row.topic_id);
      redisClient.sadd('topic' + row.topic_id, row.tokens);
    });

  });


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
        var message_data = JSON.parse(data.payload).data;
        logger.info('-->', message_data.topic_id);
        redisClient.smembers('topic' + message_data.topic_id, function(err, reply) {
          logger.debug('Got from redis', reply.length, 'tokens');
          sendMessagePush(reply, message_data);
          logger.debug('Sent push notifications');
        });
        break;
      case 'topic_events':
        logger.info('New topic event fired');
        logger.info(data.payload);
        var topic_data = JSON.parse(data.payload).data;
        redisClient.smembers('topic' + topic_data.id, function(err, reply) {
          logger.debug('Got from redis', reply.length, 'tokens');
          sendTopicPush(reply, topic_data);
          logger.debug('Sent push notifications');
        });
        break;
      default:
        logger.warn('Some event fired in DB');
    }
  });

});

var sendMessagePush = function(regTokens, message_data) {

  logger.debug('GCM Push Notification worker got', regTokens);

  // initialize new gcm message
  var message = new gcm.Message();

  // add data to message
  message.addData('offline_messages', message_data);

  // set up the sender with gcm_api_key
  var sender = new gcm.Sender(config.gcm_api_key);

  // now the sender can be used to send messages
  sender.send(message, { registrationTokens: regTokens }, function (err, response) {
      if(err)logger.error('GCM server responded with error', err);
      logger.debug(response);
  });

};

var sendTopicPush = function(regTokens, topic_data) {

  if(regTokens.length === 0){
    logger.warn('No offline users');
    return;
  }

  logger.debug('GCM Push Notification worker got', regTokens);

  // initialize new gcm message
  var message = new gcm.Message();

  // add data to message
  message.addData('offline_topic_created', topic_data);

  // set up the sender with gcm_api_key
  var sender = new gcm.Sender(config.gcm_api_key);

  // now the sender can be used to send messages
  sender.send(message, { registrationTokens: regTokens }, function (err, response) {
      if(err)logger.error('GCM server responded with error', err);
      logger.debug(response);
  });

};
