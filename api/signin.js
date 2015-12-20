var db = require('../db');
var getUsernameQuery = 'SELECT username FROM users WHERE id=(SELECT user_id FROM tokens WHERE token=$1)';

var signinUser = module.exports = function(client, token, logger, callback) {

  // token not given
  if(!token) {
    var msg = 'token not given';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg }, true);
  }

  // get token
  var getUsername = client.query(getUsernameQuery, [token]);
  getUsername.on('error', function(err) {
    var msg = 'invalid token';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg }, true);
  });

  getUsername.on('row', function(row) {
    return callback({ 'status': 'ok', 'username': row.username}, false);
  });

}
