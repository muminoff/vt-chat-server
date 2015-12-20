var db = require('../db');
var getSubscribedTopicsQuery = 'SELECT topic_id FROM subscribers WHERE user_id=(SELECT id FROM users WHERE username=$1)';

var subscribedTopics = module.exports = function(client, username, logger, callback) {

  logger.debug('inside subscribedtopics api');

  // get subscribed topics
  client.query(getSubscribedTopicsQuery, [username], function(err, result) {
    if(err){
      logger.error('Error when getting subscribed topics for username ', username);
      logger.error(err);
      return callback({ 'status': 'fail', 'detail': 'invalid username' });
    }
    else {
      logger.debug('No error when getting subscribed topics with username', username);
      logger.debug('This is result rows from db', result.rows);
      return callback({ 'status': 'ok', 'data': result.rows});
    }
  });

}
