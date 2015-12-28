var gcm = require('node-gcm');
var config = require('./utils/config');

var gcmSendPush = module.exports = function(client, user_id, message, logger, callback) {

  var message = new gcm.Message();

	message.addData('key1', 'msg1');

  // TODO: get reg token by user_id
	var regTokens = ['YOUR_REG_TOKEN_HERE'];

	var sender = new gcm.Sender(config.gcm_api_key);

	// TODO: replace returning to callback
	sender.send(message, { registrationTokens: regTokens }, function (err, response) {
			if(err) console.error(err);
			else    console.log(response);
	});

	sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
			if(err) console.error(err);
			else    console.log(response);
	});

}
