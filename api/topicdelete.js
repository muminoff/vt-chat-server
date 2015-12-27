var topicSubscribersDeleteQuery = 'DELETE FROM subscribers WHERE topic_id=$1';
var topicDeleteQuery = 'DELETE FROM topics WHERE id=$1 AND owner=$2';

var topicDelete = module.exports = function(client, topic_id, owner, logger, callback) {

  // topic delete
  client.query(topicSubscribersDeleteQuery, [topic_id], function(err, result) {

    if(err) {
      logger.error(err);
    }

    client.query(topicDeleteQuery, [topic_id, owner], function(err, result) {

    if(err) {
      logger.error(err);
    }

    return callback(topic_id);

    });

  });

}
