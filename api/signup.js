// var insertUserQuery = 'INSERT INTO users (username, phone_number) values($1, $2)';
var insertUserQuery = 'INSERT INTO users (username, phone_number) SELECT CAST($1 AS VARCHAR), CAST($2 AS VARCHAR) WHERE NOT EXISTS (SELECT id FROM users WHERE phone_number=$2)';
var getTokenQuery = 'SELECT token FROM tokens WHERE user_id=(SELECT id FROM users WHERE phone_number=$2)';

var signupUser = module.exports = function(client, username, phone_number, logger, callback) {

  client.query(insertUserQuery, [username, phone_number], function(err, result) {

    if(err) {
      logger.error(err);
    }

    logger.debug('Inserting user inside signup api ...');

    client.query(getTokenQuery, [username], function(err, result) {

      if(err) {
        logger.error(err);
      }

      logger.debug('Getting token inside signup api ...');
      logger.debug('Got token', result.rows[0], 'from db');
      callback(result.rows[0]);

    });

  });
}
