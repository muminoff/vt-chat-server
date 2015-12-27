var getTopicListQuery = 'SELECT id FROM topics WHERE id in (SELECT topic_id FROM subscribers WHERE user_id=$1)';

var topicList = module.exports = function(client, user_id, logger, callback) {

  client.query(getTopicListQuery, [user_id], function(err, result) {

    if(err) {
      logger.error(err);
    }

    logger.debug('Getting user topic list for user', user_id);
    logger.debug('Got list from DB', result.rows);

    return callback(result.rows);
  });

}
