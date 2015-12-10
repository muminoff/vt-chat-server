var pg = require('pg').native;
var conString = "postgres://vt:vt@localhost/vt";

pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('Cannot connect');
  }
  client.query('select * from users where username=$1', ['sardor'], function(err, result) {
    done();
    if(err) {
      return console.error('Cannot run query');
    }
    console.log(JSON.loads(result.rows[0]));
    client.end();
  });
});
