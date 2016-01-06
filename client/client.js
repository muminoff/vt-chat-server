var socket = require('socket.io-client')('http://chat.drivers.uz:3000');
socket.on('connect', function(){
  console.log('Connected to socket.io server');
  socket.emit('signin_request', {'token': '7de6d9bc19e24d6bb6ef50cacc95e745'});
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
socket.on('topic_message', function(data){
  console.log('Message came ->', data);
});
socket.on('topic_events', function(data){
  console.log('Topic event came', data);
});
