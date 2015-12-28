var socket = require('socket.io-client')('http://121.135.130.247:3000');
// var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){
  console.log('Connected to socket.io server');
  socket.emit('signin_request', {'token': 'df177b49e3bb40199e2c7c19f500c2f7'});
  setTimeout(function() {
    socket.emit('roomlist_request');
  }, 1000);
  setTimeout(function() {
    socket.emit('topiclist_request', { room_id: 1 });
  }, 2000);
});
socket.on('signin_response', function(data){
  console.log(data);
});
socket.on('roomlist_response', function(data){
  console.log(data);
});
socket.on('topiclist_response', function(data){
  console.log(data);
});
socket.on('topic_events', function(data){
  console.log('Topic event came', data);
});
