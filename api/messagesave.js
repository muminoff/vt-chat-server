var insertMessageQuery = 'INSERT INTO messages (stamp_id, topic_id, sender, reply_to, body, attrs) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, stamp_id, topic_id, (SELECT username FROM users WHERE id=$3) as sender, reply_to, body, attrs, extract(epoch from sent_at)::int as sent_at';

var messageSave = module.exports = function(client, stamp_id, topic_id, sender, reply_to, body, attrs, logger, callback) {
  logger.debug('These are what we got', topic_id, sender, reply_to, body);

  client.query(insertMessageQuery, [stamp_id, topic_id, sender, reply_to, body, attrs], function(err, result) {

    if(err) {
      logger.error(err);
    }

    logger.debug('Inserting message inside api ...');
    return callback(result.rows[0]);

  });
}
