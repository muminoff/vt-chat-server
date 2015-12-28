var config = require('./utils/config');
var express = require('express');
var app = express();
var server = require('http').createServer(app);

var port = config.port[Math.floor(Math.random() * config.port.length)];
console.log('Random port chosen ->', port);

server.listen(port, function() {
  process.on('uncaughtException', function(err) {
    if(err.errno === 'EADDRINUSE')
      console.log('Port', port, 'busy');
    else
      console.log(err);
  });
  console.info('Listening on port', port);
});
