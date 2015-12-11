// Setup basic express server
var express = require('express'); // http framework
var app = express(); //app
var server = require('http').createServer(app); // main server
var winston = require('winston'); // log handler
var io = require('socket.io')(server, {
    logger: {
      debug: winston.debug,
      info: winston.info,
      error: winston.error,
      warn: winston.warn
    }
});
var port = process.env.PORT || 3000;
var pg = require('pg');

winston.level = 'debug';


// Routing
// Static site is disabled for now
// app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  var pgConnString = "postgres://vt@localhost/vt";

  // signup api
  socket.on('signup_request', function (data) {
    winston.log('debug', data.username, data.phone_number);
    var username = data.username;
    var phone_number = data.phone_number;
    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      console.log("Going to insert --->", username, phone_number);
      var signup_query = 'INSERT INTO users(username, phone_number) values($1, $2) returning username, code, activated, extract(epoch from joined)::int as joined';
      client.query(signup_query, [username, phone_number], function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        socket.emit('signup_response', result.rows[0]);
      });
    });
  });
});


server.listen(port, function () {
  winston.log('debug', 'Server listening at port %d', port);
});
