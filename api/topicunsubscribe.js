var topicDeleteQuery = 'DELETE FROM topics WHERE topic_id=$1 AND user_id=$2';

var topicDelete = module.exports = function(client, topic_id, owner, logger, callback) {

  // topic create
  client.query(topicDeleteQuery, [topic_id, owner, attrs], function(err, result) {

    if(err) {
      logger.error(err);
      return callback({ 'status': 'fail', 'detail': err });
    }

    return callback({ 'status': 'ok' });

  });

}
