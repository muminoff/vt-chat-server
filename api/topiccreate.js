var db = require('../db');
// "title" character varying(32) not null,
// "body" text,
// "parent_room" bigint not null references rooms(id),
// "archived" bool default false,
// "owner" bigint not null references users(id),
// "attrs" jsonb,
var createTopicQuery = 'INSERT INTO topics (title, body, parent_room, owner, attrs) VALUES($1, $2, $3, $4, $5)';

var topicCreate = module.exports = function(client, title, body, parent_room_id, owner, attrs, logger, callback) {

  // roomId not given
  if(!roomId) {
    var msg = 'room id not given';
    logger.error(msg);
    return callback({ 'status': 'fail', 'detail': msg });
  }

  // get topic list
  client.query(createTopicQuery, [title, body, parent_room_id, owner, attrs], function(err, result) {

    if(err) {
      var msg = 'invalid room id';
      logger.error(msg);
      return callback({ 'status': 'fail', 'detail': msg });
    }

    return callback({ 'status': 'ok', 'detail': result.rows[0] });

  });

}
