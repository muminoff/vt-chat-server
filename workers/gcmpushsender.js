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

// initialize DB with client pool
pg.connect(pgConnectionString, function(err, client, done) {

  // on database connection failure
  if(err){
    logger.error('Cannot connect to PostgreSQL');
    logger.error(err);
    process.exit(-1);
  }

  logger.info('Connected to PostgreSQL');

  client.query('select s.topic_id, array_agg(u.gcm_token) as tokens from subscribers s right join users u on u.id = s.user_id group by s.topic_id', function(err, result) {
    if(err)logger.error('Cannot get gcm_tokens');

    result.rows.forEach(function(row) {
      logger.debug('--------------->', row);
      redisClient.sadd('topic' + row.topic_id, row.tokens);
    });

  });


  client.query('LISTEN message_events', function(err, result) {
    if(err)logger.error('Cannot listen to message_event');
    logger.info('Listener started for message_events');
  });


  client.on('notification', function(data) {
    switch (data.channel) {
      case 'message_events':
        logger.info('New message event fired');
        logger.info(data.payload);
        var message_data = JSON.parse(data.payload).data;
        logger.info('-->', message_data.topic_id);
        redisClient.smembers('topic' + message_data.topic_id, function(err, reply) {
          logger.debug('Got from redis', reply);
          sendGCMPushNotification(reply, message_data);
        });
        // logger.debug(topicsWithTokens);
        // var message_data = JSON.parse(data.payload);
        // logger.debug(message_data);
        // var regTokens = redisClient.smembers('topic' + message_data.topic_id + ':gcm_tokens')
        break;
      default:
        logger.warn('Some event fired in DB');
    }
  });

});

var sendGCMPushNotification = function(regTokens, message_data) {

  logger.debug('GCM Push Notification worker got', regTokens);

  // initialize new gcm message
  var message = new gcm.Message();

  // add data to message
  message.addData(message_data.topic_id, message_data);

  // set up the sender with gcm_api_key
  var sender = new gcm.Sender(config.gcm_api_key);

  // now the sender can be used to send messages
  sender.send(message, { registrationTokens: regTokens }, function (err, response) {
      if(err)logger.error('GCM server responded with error', err);
      logger.debug(response);
  });

};
