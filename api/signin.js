var db = require('../db');
var getUsernameQuery = 'SELECT username FROM users WHERE id=(SELECT user_id FROM tokens WHERE token=$1)';

var signinUser = module.exports = function(client, token, logger, callback) {

  logger.debug('inside signin api');

  // token not given
  if(!token) {
    var msg = 'token not given';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg });
  }

  logger.debug('got token', token);

  // get token
  client.query(getUsernameQuery, [token], function(err, result) {
    if(err){
      logger.error('Error when getting username with token', token);
      logger.error(err);
      return callback({ 'status': 'fail', 'detail': 'invalid token' });
    }
    else {
      logger.debug('No error when getting username with token', token);
      logger.debug('This is result rows from db', result.rows);
      return callback({ 'status': 'ok', 'username': result.rows[0].username});
    }
  });

}
