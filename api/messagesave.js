var insertMessageQuery = 'INSERT INTO messages (topic_id, sender, reply_to, body) VALUES($1, $2, $3, $4) RETURNING id, (SELECT username FROM users WHERE id=$2) as sender, topic_id, reply_to, body, attrs, extract(epoch from sent_at)::int as sent_at';

var messageSave = module.exports = function(client, topic_id, sender, body, reply_to, logger, callback) {
  logger.debug('These are what we got', topic_id, sender, reply_to, body);

  client.query(insertMessageQuery, [topic_id, sender, reply_to, body], function(err, result) {

    if(err) {
      logger.error(err);
    }

    logger.debug('Inserting message inside api ...');
    return callback(result.rows[0]);

  });
}
