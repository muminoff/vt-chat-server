var pg = require('pg');
var connString = 'postgres://vt:vt@localhost/vt';
var client = new pg.Client(connString);
client.connect();

var query = client.query('select username, phone_number, token, extract(epoch from generated)::int as generated from tokens inner join users on tokens.user_id=users.id where user_id=2');
query.on('row', function(row) {
  console.log(JSON.stringify(row));
});
