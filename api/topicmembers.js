var getTopicMembersQuery = 'select id, username, roles, profile, vt from users where id in (select user_id from subscribers where topic_id=$1)';

var topicMembers = module.exports = function(client, topic_id, logger, callback) {

  client.query(getTopicMembersQuery, [topic_id], function(err, result) {

    if(err) {
      logger.error(err);
    }

    return callback(result.rows);
  });

}
