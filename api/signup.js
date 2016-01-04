var insertUserQuery = 'INSERT INTO users (username, phone_number, gcm_token) SELECT CAST($1 AS VARCHAR), CAST($2 AS VARCHAR), CAST($3 AS TEXT) WHERE NOT EXISTS (SELECT id FROM users WHERE phone_number=$2)';
var getTokenQuery = 'SELECT user_id, token FROM tokens WHERE user_id=(SELECT id FROM users WHERE phone_number=$1)';

var signupUser = module.exports = function(client, username, phone_number, gcm_token, logger, callback) {

  client.query(insertUserQuery, [username, phone_number, gcm_token], function(err, result) {

    if(err) {
      logger.error("WAS ATTEMPTING TO INSERT USER", err);
    }

    logger.debug('Inserting user inside signup api ...');

    client.query(getTokenQuery, [phone_number], function(err, result) {

      if(err) {
        logger.error("WAS ATTEMPTING TO GET TOKEN OF USER", err);
      }

      logger.debug('Getting token inside signup api ...');
      logger.debug('Got token', result.rows[0], 'from db');
      callback(result.rows[0]);

    });

  });
}
