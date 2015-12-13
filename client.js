// var socket = require('socket.io-client')('http://121.135.130.247:3000');
var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){
  console.log('Connected to socket.io server');
  // socket.emit('signup_request', {'username': 'sardor7', 'phone_number': '998931234594', 'device_id': 'myimei'});
  // socket.emit('verification_request', {'username': 'sardor7' });
  socket.emit('roomlist_request', {'auth_token': 'thisismytoken' });
});
socket.on('roomlist_response', function(data){
  console.log(data);
});
socket.on('disconnect', function(){
});
