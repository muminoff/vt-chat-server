var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('key1', 'msg1');

var regTokens = ['APA91bHS3vcWjB4jAZ-1R-urKsDTh1g0cl2EfA5LcIwOsPjZyf-YrcDrPCypmA9AyBK715kwk821jkXNfeNeKQpiuB9TheBgLfAS2mi8hLDIiVnr5xRmKP0bZ3Nshh2OFYsg0Zt3fGxM'];

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
