var db = require('../db');
var insertUserQuery = 'INSERT INTO users (username, phone_number) SELECT CAST($1 AS VARCHAR), CAST($2 AS VARCHAR) WHERE NOT EXISTS (SELECT id FROM users WHERE phone_number=$2)';
var getTokenQuery = 'SELECT token FROM tokens WHERE user_id=(SELECT id FROM users WHERE phone_number=$1)';

var signupUser = module.exports = function(client, username, phone_number, logger, callback) {

  // username not given
  if(!username) {
    var msg = 'Username not given';
    logger.error(msg);
    callback({ 'status': 'fail', 'detail': msg });
  }

  logger.debug(insertUserQuery);

  // phone_number not given
  if(!phone_number) {
    var msg = 'Phone number not given';
    logger.error(msg);
    callback({ 'status': 'fail', 'detail': msg });
  }

  // insert username and phone_number
  var insertUser = client.query(insertUserQuery, [username, phone_number]);
  insertUser.on('error', function(err) {
    logger.error("==============================>");
    logger.error(err);
  });
  var getToken = client.query(getTokenQuery, [phone_number]);
  getToken.on('error', function(err) {
    logger.error("==============================>");
    logger.error(err);
  });
  getToken.on('row', function(row) {
    callback(JSON.stringify(row));
  });

}
