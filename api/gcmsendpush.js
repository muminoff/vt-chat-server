var gcm = require('node-gcm');

var gcmSendPush = module.exports = function(client, gcm_api_key, message, logger, callback) {

    var message = new gcm.Message();

    message.addData(message.topic_id, message.body);
    message.addNotification('title', message.topic_id);
    message.addNotification('icon', 'ic_launcher');
    message.addNotification('body', message.body);


    var regTokens = ['APA91bEMKwnXyx0maS0Vg4AfFhUbL-DVurklEr4-JHUvhcGzXzueQ1aSnBto1RGbW9uZv-BWVnDOn8-1bfAY0C5XCPoRfPgjYjUhqS-iAwFaS5PEm9Ki9S3DjgBFhPIOQBIFMp6CSBOA'];

    var sender = new gcm.Sender(gcm_api_key);

    sender.send(message, regTokens, function (err, response) {
        if(err) {
          logger.error(err);
          return callback(false);
        } else {
          logger.info(response);
          return callback(true);
        }
    });

  // var message = new gcm.Message();

	// message.addData('key1', 'msg1');

  // // TODO: get reg token by user_id
	// var regTokens = ['YOUR_REG_TOKEN_HERE'];

	// var sender = new gcm.Sender(config.gcm_api_key);

	// // TODO: replace returning to callback
	// sender.send(message, { registrationTokens: regTokens }, function (err, response) {
			// if(err) console.error(err);
			// else    console.log(response);
	// });

	// sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
			// if(err) console.error(err);
			// else    console.log(response);
	// });

}
