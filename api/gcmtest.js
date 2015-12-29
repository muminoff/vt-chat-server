var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('key1', 'msg1');

var regTokens = ['APA91bHL8Tjau4Ex4oJeO9r3kgFSwAPdy4AS8qHPXqj7sUkb-KwfinLV-HhA7b-35IKlBkdDA082DJytMDG19-Y1ONXfTwhqX-hSawOGMw6Lr5weuy0TOfmY_Da2yWnTT7nv_iLnB2Ig'];

// Set up the sender with you API key
var sender = new gcm.Sender('AIzaSyBBaV6nqZtFaQnKzRNK9i_g-jcBU77ji00');

// Now the sender can be used to send messages
sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if(err) console.error(err);
    else    console.log(response);
});

// Send to a topic, with no retry this time
sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
    if(err) console.error(err);
    else    console.log(response);
});
