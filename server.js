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
var pg = require('pg').native;

winston.level = 'debug';

io.on('connection', function (socket) {
  var addedUser = false;
  var pgConnString = "postgres://vt@localhost/vt";
  var doSignupQuery = 'insert into users(username, phone_number, device_id) values($1, $2, $3) returning username, phone_number, device_id, verification_code';
  var insertTokenQuery = 'insert into tokens(username) values($1) returning username, auth_token, extract(epoch from expires)::int as expires';
  var checkAuthToken = 'select username from tokens where username="$1"';
  var getRoomListQuery = 'select id::int, subject, description, created_by, extract(epoch from created_at)::int as created_at from rooms';

  // signup api
  socket.on('signup_request', function (data) {
    // winston.log('debug', data.username, data.phone_number);
    winston.log('debug', data);
    var username = data.username;
    var phone_number = data.phone_number;
    var device_id = data.device_id;

    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query(doSignupQuery, [username, phone_number, device_id], function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        socket.emit('signup_response', result.rows[0]);
      });
    });

  });

  // verification api
  socket.on('verification_request', function (data) {
    winston.log('debug', data);
    var username = data.username;

    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query(insertTokenQuery, [username], function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        socket.emit('verification_response', result.rows[0]);
      });
    });

  });

  // room api
  socket.on('roomlist_request', function (data) {
    winston.log('debug', data);
    var username = data.username;
    var auth_token = data.auth_token;

    if(!auth_token){
      socket.emit('roomlist_response', {'status': 'error', 'detail': 'auth_token not given'});
      return;
    }

    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query(getRoomListQuery, function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        socket.emit('roomlist_response', result.rows[0]);
      });
    });

  });
});


server.listen(port, function () {
  winston.log('debug', 'Server listening at port %d', port);
});
