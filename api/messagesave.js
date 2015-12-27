// "topic_id" bigint not null references topics(id),
// "sender" bigint not null references users(id),
// "reply_to" bigint references messages(id),
// "body" text not null,
// "attrs" jsonb,
var insertMessageQuery = 'INSERT INTO messages (topic_id, sender, reply_to, body) VALUES($1, $2, $3, $4) RETURNING id, topic_id, sender, reply_to, body, attrs, extract(epoch from sent_at)::int as sent_at';

var messageSave = module.exports = function(client, topic_id, sender, reply_to, body, logger, callback) {

  client.query(insertMessageQuery, [topic_id, sender, reply_to, body], function(err, result) {

    if(err) {
      logger.error(err);
    }

    logger.debug('Inserting message inside api ...');
    return callback(result.rows[0]);

  });
}
