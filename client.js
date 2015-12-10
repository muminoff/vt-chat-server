var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){
  console.log('Connected to socket.io server');
});
socket.on('event', function(data){
});
socket.on('disconnect', function(){
});
