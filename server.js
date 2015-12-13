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
  var doSignupQuery = 'insert into users(username, phone_number) values($1, $2)';
  var getAuthToken = 'select token from tokens where username=$1';
  var checkAuthToken = 'select username from tokens where token=$1';
  // var getRoomListQuery = 'select id::int, subject, description, created_by, extract(epoch from created_at)::int as created_at from rooms';

  // signup api
  socket.on('signup_request', function (data) {
    winston.log('debug', data);
    var username = data.username;
    var phone_number = data.phone_number;

    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(doSignupQuery, [username, phone_number], function(err, result) {

        if(err) {
          return console.error('error running query', err);
        }

        client.query(getAuthToken, [username], function(err, result) {
          if(err) {
            return console.error('error running query', err);
          }
          socket.emit('signup_response', result.rows[0]);

          done();
        });
      });
    });

  });

  // login api
  socket.on('login_request', function (data) {
    winston.log('debug', data);
    var token = data.token;

    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(checkAuthToken, [token], function(err, result) {

        if(result){
          console.log("------------------>", result.rows[0]);
          socket.emit('login_response', {'status': 'ok'});
        }

        if(err) {
          return console.error('error running query', err);
        }

        done();

      });
    });

  });

});


server.listen(port, function () {
  winston.log('debug', 'Server listening at port %d', port);
});
