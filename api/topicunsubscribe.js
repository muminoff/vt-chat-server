var deleteUserFromSubscribersQuery = 'DELETE FROM subscribers WHERE user_id=$1 AND topic_id=$2';

var topicUnsubscribe = module.exports = function(client, user_id, topic_id, logger, callback) {

  // unsubscribe from topic
  client.query(deleteUserFromSubscribersQuery, [user_id, topic_id], function(err, result) {

    if(err) {
      logger.error(err);
      callback(false);
    }

    if(result) {
      callback(true);
    }

  });

}
