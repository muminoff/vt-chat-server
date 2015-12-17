var pg = require('pg');
var connString = 'postgres://vt:vt@localhost/vt';
var client = new pg.Client(connString);
client.connect();
var query = client.query('select username, phone_number, roles, profile, vt, extract(epoch from joined)::int as joined, extract(epoch from modified)::int as modified from users where username=\'testuser5\'');
query.on('row', function(row) {
  console.log(JSON.stringify(row));
});
