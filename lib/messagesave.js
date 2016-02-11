var insertMessageQuery = "INSERT INTO messages (stamp_id, topic_id, owner, reply_to, body, attrs, has_media) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, stamp_id, topic_id, json_build_object('id', $3, 'username', (SELECT username FROM users WHERE id=$3)) as owner, reply_to, body, attrs, (extract(epoch from sent_at) * 1000)::int8 as sent_at, has_media";
var messageSave = module.exports = function(client, stamp_id, topic_id, owner, reply_to, body, attrs, has_media, logger, callback) {
  logger.debug('These are what we got', topic_id, owner, reply_to, body, attrs, has_media);

  client.query(insertMessageQuery, [stamp_id, topic_id, owner, reply_to, body, attrs, has_media], function(err, result) {

    if(err) {
      logger.error(err);
    }

    logger.debug('Inserting message inside api ...');
    return callback(result.rows[0]);

  });
}
