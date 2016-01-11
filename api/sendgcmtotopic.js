var gcm = require('node-gcm');
var config = require('../utils/config');

var getTopicMembersQuery = 'select gcm_token from users where id in (select user_id from subscribers where topic_id=$1)';

var sendgcmtotopic = module.exports = function(client, topic_id, logger, callback) {

  client.query(getTopicMembersQuery, [topic_id], function(err, result) {

    if(err) {
      logger.error(err);
    }

    // return callback(result.rows);

    var message = new gcm.Message();

    message.addData('reconnect', 'reconnect');

    var sender = new gcm.Sender(config.gcm_api_key);
    var regTokens = result.rows;
    var newTokens = [];
    logger.debug("Tokens", regTokens);
    regTokens.forEach(function(regToken) {
      newTokens.push(regToken.gcm_token);
      logger.debug(regToken.gcm_token);
    });

    sender.send(message, { registrationTokens: newTokens }, function (err, response) {
      if(err) logger.error(err);
      else logger.debug(response);
    });
  });

}
