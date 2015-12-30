var socket = require('socket.io-client')('http://121.135.130.247:3000');
// var socket = require('socket.io-client')('http://localhost:6001');
socket.on('connect', function(){
  console.log('Connected to socket.io server');
  socket.emit('signin_request', {'token': '8c47ee672b6c4826af44494af3fefe09'});
  setTimeout(function() {
    socket.emit('roomlist_request');
  }, 1000);
  setTimeout(function() {
    socket.emit('topiclist_request', { room_id: 1 });
  }, 2000);
  setTimeout(function() {
    socket.emit('topic_message', { topic_id: 1, body: 'salom gcm', reply_to: null });
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
