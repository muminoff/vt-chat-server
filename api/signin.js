var db = require('../db');
var getUsernameQuery = 'SELECT username FROM users WHERE id=(SELECT user_id FROM tokens WHERE token=$1)';

var checkToken = module.exports = function(client, token, logger, callback) {

  logger.debug('inside signin api');

  // token not given
  if(!token) {
    callback(false);
  }

  logger.debug('got token', token);

  // get token
  client.query(getUsernameQuery, [token], function(err, result) {
    if(err){
      callback(false);
    }
    else {
      logger.debug('No error when getting username with token', token);
      logger.debug('This is result rows from db', result.rows);
      callback(true);
    }
  });

}
