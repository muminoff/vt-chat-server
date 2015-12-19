// var socket = require('socket.io-client')('http://121.135.130.247:3000');
var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){
  var myToken = 'e92a1e6551f34e1c9a62736d77a5eafc';
  console.log('Connected to socket.io server');
  // socket.emit('signup_request', {'username': 'foob1ar2', 'phone_number': '9981234'});
  socket.emit('signup_request', {'username': '9981234'});
  // socket.emit('login_request', {'token': myToken });
  // socket.emit('roomlist_request', {'token': myToken });
  // socket.emit('topiclist_request', {'room_id': 1});
});
// socket.on('topiclist_response', function(data){
socket.on('signup_response', function(data){
  console.log(data);
});
// socket.on('disconnect', function(){
// });
