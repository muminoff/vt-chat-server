// redis client
var redis = require('redis');

// redis client instance
var redisClient = redis.createClient();

// redisClient.sadd('soo', 'bar');

// redisClient.smembers('topic1', function(err, reply) {
//   console.log(reply);
// });
redisClient.srem('1', '12');
