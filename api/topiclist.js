var getTopicListQuery = 'SELECT id, title, body, parent_room, archived, owner, attrs, EXTRACT(epoch FROM created_at)::int as created_at FROM topics WHERE parent_room=$1 AND id in (SELECT topic_id FROM subscribers WHERE user_id=$2)';

var topicList = module.exports = function(client, room_id, user_id, logger, callback) {

  client.query(getTopicListQuery, [room_id, user_id], function(err, result) {

    if(err) {
      logger.error(err);
    }

    return callback(result.rows);
  });

}
