var insertUserStatusQuery = "update statuses set last_seen=now() where user_id=$1";
var insertUserStatus = module.exports = function(client, user_id, logger, callback) {

  client.query(insertUserStatusQuery, [user_id], function(err, result) {

    if(err) {
      logger.error('Cannot insert status in DB for user', user_id);
      logger.error(err);
      callback(false);
    }

    logger.debug('Inserting user status inside api ...');
    return callback(true);

  });
}
