var topicDeleteQuery = ' FROM topics WHERE id=$1 AND owner=$2';

var topicDelete = module.exports = function(client, topic_id, owner, logger, callback) {

  // topic create
  client.query(topicDeleteQuery, [topic_id, owner], function(err, result) {

    if(err) {
      logger.error(err);
      return callback({ 'status': 'fail', 'detail': err });
    }

    return callback({ 'status': 'ok' });

  });

}
