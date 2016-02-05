var insertMessageQuery = "INSERT INTO messages (stamp_id, topic_id, owner, reply_to, body, attrs, is_media, media_type, media_path, media_name, media_size) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, stamp_id, topic_id, json_build_object('id', $3, 'username', (SELECT username FROM users WHERE id=$3)) as owner, reply_to, body, attrs, extract(epoch from sent_at)::int as sent_at, is_media, media_type, media_path, media_name, media_size";

var messageSave = module.exports = function(client, stamp_id, topic_id, owner, reply_to, body, attrs, is_media, media_type, media_path, media_name, media_size, logger, callback) {
  logger.debug('These are what we got', topic_id, owner, reply_to, body, attrs, is_media, media_type, media_path, media_name, media_size);

  client.query(insertMessageQuery, [stamp_id, topic_id, owner, reply_to, body, attrs, is_media, media_type, media_path, media_name, media_size], function(err, result) {

    if(err) {
      logger.error(err);
    }

    logger.debug('Inserting message inside api ...');
    return callback(result.rows[0]);

  });
}
