var getAllTopicsQuery = 'SELECT id FROM topics WHERE closed=false AND archived=false';

var allTopics = module.exports = function(client, logger, callback) {
  client.query(getAllTopicsQuery, [], function(err, result) {
    if(err)logger.error(err);
    if(result)callback(result.rows);
  });

}
