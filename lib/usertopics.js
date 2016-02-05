var getUserTopicsQuery = 'SELECT id FROM topics WHERE archived=false';

var userTopics = module.exports = function(client, logger, callback) {
  client.query(getUserTopicsQuery, function(err, result) {
    if(err)callback(err, null);
    callback(null, result.rows);
  });

}
