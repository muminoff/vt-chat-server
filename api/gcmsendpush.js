var gcm = require('node-gcm');

var gcmSendPush = module.exports = function(client, gcm_api_key, message, logger, callback) {

    logger.debug('Using gcm_api_key', gcm_api_key);

    var message = new gcm.Message();

    message.addData('msg', 'bironnima');


    var regTokens = ['APA91bHL8Tjau4Ex4oJeO9r3kgFSwAPdy4AS8qHPXqj7sUkb-KwfinLV-HhA7b-35IKlBkdDA082DJytMDG19-Y1ONXfTwhqX-hSawOGMw6Lr5weuy0TOfmY_Da2yWnTT7nv_iLnB2Ig'];

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
