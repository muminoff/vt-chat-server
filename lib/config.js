var yaml = require('js-yaml');
var fs = require('fs');

var config = module.exports = yaml.safeLoad(fs.readFileSync('conf/config.yml', 'utf8'));
