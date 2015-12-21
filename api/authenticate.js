var getUserIdQuery = 'SELECT id, username, phone_number FROM users WHERE id=(SELECT user_id FROM tokens WHERE token=$1)';

var authenticate = module.exports = function(client, token, logger, callback) {
  client.query(getUserIdQuery, [token], function(err, result) {
    callback(result.rows[0]);
  });
}

