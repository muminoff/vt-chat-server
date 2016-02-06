var getUserTopicsQuery = 'SELECT topic_id FROM subscribers WHERE user_id=$1';

var userTopics = module.exports = function(client, user_id, logger, callback) {
  client.query(getUserTopicsQuery, [user_id], function(err, result) {
    if(err)logger.error(err);
    if(result)callback(result.rows);
  });

}
