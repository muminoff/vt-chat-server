var getTopicListQuery = 'SELECT id, title, body, parent_room, archived, owner, attrs, EXTRACT(epoch FROM created_at)::int as created_at FROM topics WHERE parent_room=$1';

var topicList = module.exports = function(client, room_id, logger, callback) {

  client.query(getTopicListQuery, [room_id], function(err, result) {
    callback(result.rows);
  });

}
