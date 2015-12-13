
  room api
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
