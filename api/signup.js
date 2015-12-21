var insertUserQuery = 'INSERT INTO users (username, phone_number) SELECT CAST($1 AS VARCHAR), CAST($2 AS VARCHAR) WHERE NOT EXISTS (SELECT id FROM users WHERE phone_number=$2)';
var getTokenQuery = 'SELECT token FROM tokens WHERE user_id=(SELECT id FROM users WHERE phone_number=$1)';

var signupUser = module.exports = function(client, username, phone_number, logger, callback) {

  logger.debug('Inside signup api');
  logger.debug('Got username', username);
  logger.debug('Got phone_number', phone_number);

  // username not given
  if(!username) {
    var msg = 'Username not given';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg });
  }

  logger.debug('I passed username checking');

  // phone_number not given
  if(!phone_number) {
    var msg = 'Phone number not given';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg });
  }

  logger.debug('I passed phone_number checking');

  // insert username and phone_number
  client.query(insertUserQuery, [username, phone_number], function(err, result){
    logger.debug('Inside insert user query');

    if(err) {
      logger.debug('Error inside insert user query');
    }

  });

  client.query(getTokenQuery, [phone_number], function(err, result) {
    logger.debug('Inside get token query');

    if(err) {
      logger.debug('Error inside get token query');
    } else {
      logger.debug('No error when getting token with phone_number', phone_number);
      logger.debug('This is result rows from db', result.rows);
      callback(result.rows[0]);
    }

  });


}
