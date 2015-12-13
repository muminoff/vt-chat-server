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

io.on('connection', function (socket) {
  var addedUser = false;
  var pgConnString = "postgres://vt@localhost/vt";
  var doSignupQuery = 'insert into users(username, phone_number) values($1, $2)';
  var getAuthToken = 'select token from tokens where username=$1';
  var checkAuthToken = 'select username from tokens where token=$1';
  var getRoomListQuery = 'select id::int, subject, description, owner, extract(epoch from created_at)::int as created_at from rooms';
  var getTopicListQuery = 'select id::int, title, body, parent_room::int, owner, is_archived, extract(epoch from created_at)::int as created_at, data from topics where parent_room=$1';

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
          console.log(result.rows[0]);
          socket.emit('login_response', {'status': 'ok'});
        }

        if(err) {
          return console.error('error running query', err);
        }

        done();

      });
    });

  });

  // roomlist api
  socket.on('roomlist_request', function (data) {
    winston.log('debug', data);

    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(getRoomListQuery, function(err, result) {

        if(result){
          console.log(result.rows);
          socket.emit('roomlist_response', result.rows);
        }

        if(err) {
          return console.error('error running query', err);
        }

        done();

      });
    });

  });

  // roomlist api
  socket.on('topiclist_request', function (data) {
    winston.log('debug', data);
    var room_id = data.room_id;

    pg.connect(pgConnString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(getTopicListQuery, [room_id], function(err, result) {

        if(result){
          console.log(result.rows);
          socket.emit('topiclist_response', result.rows);
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
