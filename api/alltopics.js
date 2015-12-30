var getAllTopicsQuery = 'SELECT topic_id, user_id FROM subscribers';

var getAllTopics = module.exports = function(client, logger, callback) {

  client.query(getAllTopicsQuery, function(err, result) {

    if(err) {
      logger.error(err);
      return;
    }

    callback(result.rows);
  });

}
