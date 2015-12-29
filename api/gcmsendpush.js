var gcm = require('node-gcm');

var gcmSendPush = module.exports = function(gcm_api_key, gcm_tokens, message, logger, callback) {

    logger.debug('Using gcm_api_key', gcm_api_key);

    var message = new gcm.Message();

    message.addData('msg', message);
    var sender = new gcm.Sender(gcm_api_key);

    sender.send(message, gcm_tokens, function (err, response) {
        if(err) {
          logger.error(err);
          return callback(false);
        } else {
          logger.info(response);
          return callback(true);
        }
    });

}
