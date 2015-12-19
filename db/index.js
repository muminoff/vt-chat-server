var pg = require('pg');
var pgConnUrl = 'postgres://vt:vt@localhost/vt';
module.exports = {
  query: function(text, values, cb) {
     pg.connect(pgConnUrl, function(err, client, done) {
       client.query(text, values, function(err, result) {
         done();
         cb(err, JSON.stringify(result.rows));
       })
     });
   }
}
