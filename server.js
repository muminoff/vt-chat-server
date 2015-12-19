var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var yaml = require('js-yaml');
var fs = require('fs');
var logger = require('./logger');

try {
  var config = yaml.safeLoad(fs.readFileSync('conf/config.yml', 'utf8'));
  logger.info("Config opened.");
} catch (e) {
  console.error(e);
}

var port = process.env.PORT || config.port;
var pg = require('pg');

io.on('connection', function (socket) {
  logger.debug("Client connected", type(socket));
});


server.listen(port, function () {
  logger.info('Server listening at port %d', port);
});
