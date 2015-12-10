var pg = require('pg').native;
var conString = "postgres://vt:vt@localhost/vt";

pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('Cannot connect');
  }
  client.query('select $1::int as num', ['1'], function(err, result) {
    done();
    if(err) {
      return console.error('Cannot run query');
    }
    console.log(result.rows[0]);
    client.end();
  });
});
