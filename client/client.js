var socket = require('socket.io-client')('http://121.135.130.247:3000');
// var socket = require('socket.io-client')('http://localhost:3000', {'force new connection': true,   'reconnect': true});
// var socket = require('socket.io-client')('http://localhost:3000');
// var socket = require('socket.io-client')('http://localhost:3000', { query: "token=bar" });
socket.on('connect', function(){
  // var myToken = 'e92a1e6551f34e1c9a62736d77a5eafc';
  console.log('Connected to socket.io server');
  // socket.emit('signup_request', {'username': 'bahrom25', 'phone_number': '9981255'});
  // socket.emit('signup_request', {'username': '9981235'});
  // socket.emit('login_request', {'token': myToken });
  // socket.emit('roomlist_request', {'token': myToken });
  // socket.emit('topiclist_request', {'room_id': 1});
  socket.emit('signin_request', {'token': 'c328b17d12434fcf9c0c4db2dc02740a'});
  // setTimeout(function() {
  // socket.emit('topiccreate_request', {'title': 'tttt', 'body': 'tttbody', 'parent_room': 2, 'attrs': null});
  // }, 2000);
  socket.emit('roomlist_request');
  // socket.emit('topiclist_request', {'room_id': 1});
  // setTimeout(function(){
  //   socket.emit('roomlist_request');
  // }, 1000);
});
// socket.on('topiclist_response', function(data){
// socket.on('signup_response', function(data){
socket.on('signin_response', function(data){
// socket.on('signup_response', function(data){
  console.log(data);
});
socket.on('roomlist_response', function(data){
  console.log(data);
});
// socket.on('topiclist_response', function(data){
socket.on('topiccreate_response', function(data){
  console.log(data);
});
// socket.on('disconnect', function(){
// });
