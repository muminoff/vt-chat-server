var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){
  console.log('Connected to socket.io server');
  socket.emit('signup_request', {'username': 'sardor2', 'phone_number': '998931234589'});
});
socket.on('signup_response', function(data){
  console.log(data);
});
socket.on('disconnect', function(){
});
