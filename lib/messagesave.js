var insertMessageQuery = "INSERT INTO messages (stamp_id, topic_id, owner, reply_to, body, attrs, has_media) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, stamp_id, topic_id, json_build_object('id', $3, 'username', (SELECT username FROM users WHERE id=$3)) as owner, reply_to, body, attrs, (extract(epoch from sent_at) * 1000)::int8 as sent_at, has_media";
var messageSave = module.exports = function(client, stamp_id, topic_id, owner, reply_to, body, attrs, has_media, logger, callback) {

  if(typeof(reply_to)==='string' && reply_to==='0')reply_to=null;
  logger.debug('typeof reply_to', typeof(reply_to));

  client.query(insertMessageQuery, [stamp_id, topic_id, owner, reply_to, body, attrs, has_media], function(err, result) {

    if(err) {
      logger.error('Cannot save message to DB');
      logger.error('Dump:');
      logger.error('stamp_id', stamp_id);
      logger.error('topic_id', topic_id);
      logger.error('owner', owner);
      logger.error('reply_to', reply_to);
      logger.error('body', body);
      logger.error('attrs', attrs);
      logger.error('has_media', has_media);
      logger.error(err);
    }

    return callback(result.rows[0]);

  });
}
