var getRoomListQuery = 'SELECT id::int, subject, description, owner, EXTRACT(epoch FROM created_at)::int AS created_at FROM rooms';

var roomList = module.exports = function(client, logger, callback) {

  client.query(getRoomListQuery, [], function(err, result) {
    return callback({ 'status': 'ok', 'data': result.rows});
  });

}
