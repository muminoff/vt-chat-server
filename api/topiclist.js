var db = require('../db');
var getTopicListQuery = 'SELECT id, title, body, parent_room, archived, owner, attrs, EXTRACT(epoch FROM created_at)::int as created_at FROM topics WHERE parent_room=$1';

var topicList = module.exports = function(client, roomId, logger, callback) {

  // roomId not given
  if(!roomId) {
    var msg = 'room id not given';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg });
  }

  // get topic list
  client.query(getTopicListQuery, [roomId], function(err, result) {

    if(err) {
      var msg = 'invalid room id';
      logger.error(msg);
      return callback({ 'status': 'fail', 'detail': msg });
    }

    return callback({ 'status': 'ok', 'topiclist': result.rows });

  });

}
