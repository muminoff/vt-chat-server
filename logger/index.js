var winston = require('winston');
var config = require('../utils/config');

var logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename: config.log_file,
      json: false,
      timestamp: function() {
        return Date();
      },
      formatter: function(options) {
        return options.timestamp() +' - '+ options.level.toUpperCase() + ' - ' + config.domain +' - '+ (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    }),
    // new (winston.transports.Console)({
    //     colorize: 'all'
    // })
  ]
});
