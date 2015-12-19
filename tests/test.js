var db = require('./db');

var showResult = function(err, result) {
  console.log(result);
}

// db.query('select * from users', [], showResult);

db.insertUser('sardor', '998931234567', showResult);
