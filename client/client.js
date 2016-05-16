var socket = require('socket.io-client')('http://chat.drivers.uz');
var randomstring = require('randomstring');
socket.on('connect', function(){
  console.log('Connected to socket.io server');
  socket.emit('signin_request', {'token': '1d4b0f92e73749ed92acbbb9650eedcd'});
  // setTimeout(function() {
  //   socket.emit('roomlist_request');
  // }, 1000);
  // setTimeout(function() {
  //   socket.emit('topiclist_request', { room_id: 1 });
  // }, 2000);
  var rand = Math.round(Math.random() * (300 - 200)) + 200;
  setInterval(function() {
    // var randTopic = Math.round(Math.random() * (10 - 1)) + 1;
    var randTopic = 1;
    var largeText = 'Россия банки 22 январь куни учун 1 долларни 83,54 рублга тенг деб белгилади. Бу эса долларнинг расмий курси 1 кун ичида 4 рублга ўсганини кўрсатади. Бу ҳақда Марказий банк сайтида маълум қилинган.  Евро курси ҳам 4 рублга ошиб, 91,18 рублга етган.  Қайд этиш керакки, бу орқали тарихий максимумлар қайд этилди.  Бивалюта савати нархи ҳам мутлақ максимумни янгилади ва 87 рублдан ошди.  Бугун Москва биржасида 1 доллар 84,43 рублга сотилмоқда. Доллар ва евро нархлари биржада 1 кун олдингидагидан 3 ва 3,3 рубль миқдорларида ошган.  Рублнинг нархи тушиб кетишига дунё бозорида нефтнинг нархи арзонлашаётгани сабаб бўлмоқда.  ICE биржасида бугунги савдо чоғида Brent маркали нефт фьючерсининг нархи яна 0,36 фоизга тушди. Яъни ҳозир савдо қилинаётган нефть шу йилнинг март ойида баррелига 27,78 доллардан етказиб берилади.  WTI туридаги нефть нархи Нью-Йорк товар биржасида (NYMEX) бир баррели 28,21 долларга (0,496 фоизлик тушиш) баҳоланган.  Йил бошидан буён нефть нархи 24 фоизга арзонлашган.';
    // socket.emit('topic_message', { stamp_id: randomstring.generate(6), topic_id: randTopic, body: 'vt robot test => random message ' + randomstring.generate() + '. Ignore this message' });
    socket.emit('topic_message', { stamp_id: randomstring.generate(6), topic_id: randTopic, body: largeText });
  }, rand);
});
  // setTimeout(function() {
  //   socket.emit('topiccreate_request', {title: 'test112', body: 'testbody', parent_room: 1});
  // }, 1000);
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
