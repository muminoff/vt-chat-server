var db = require('../db');
var createTopicQuery = 'INSERT INTO topics (title, body, parent_room, owner, attrs) VALUES($1, $2, $3, (SELECT id FROM users WHERE username=$4), $5) RETURNING id, title, body, parent_room, owner, attrs, EXTRACT(epoch FROM created_at)::int AS created_at';

var topicCreate = module.exports = function(client, title, body, parent_room, owner, attrs, logger, callback) {

  // roomid not given
  if(!parent_room) {
    var msg = 'parent room id not given';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg });
  }

  // get topic list
  client.query(createTopicQuery, [title, body, parent_room, owner, attrs], function(err, result) {

    if(err) {
      logger.error(err);
      return callback({ 'status': 'fail', 'detail': err });
    }

    return callback({ 'status': 'ok', 'data': result.rows[0] });

  });

}
