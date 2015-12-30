// redis client
var redis = require('redis');

// get main config
var config = require('./utils/config');

// set logger
var logger = require('./logger');
logger.level = config.log_level;

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

// gcm client
var gcm = require('node-gcm');

// initialize new gcm message
var message = new gcm.Message();

// add data to message
message.addData('key1', 'msg1');

// set up the sender with gcm_api_key
var sender = new gcm.Sender(config.gcm_api_key);

var regTokens = redisClient.smembers('topic' + topicid + ':gcm_tokens')

// now the sender can be used to send messages
sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if(err) logger.error(err);
    else logger.debug(response);
});
