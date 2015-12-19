var winston = require('winston');

var logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      level: 'silly',
      filename: './logs/vt.log',
      json: false,
      timestamp: function() {
        return Date();
      },
      formatter: function(options) {
        return options.timestamp() +' - '+ options.level.toUpperCase() +' - '+ (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    }),
    new (winston.transports.Console)({
      level: 'silly',
      colorize: 'all'
    }),
  ]
});

// logger.level = 'silly';
// logger.log('silly', JSON.stringify({"foo":"bar"}));
// logger.log('debug', "127.0.0.1 - there's no place like home");
// logger.log('verbose', "127.0.0.1 - there's no place like home");
// logger.log('info', "127.0.0.1 - there's no place like home");
// logger.log('warn', "127.0.0.1 - there's no place like home");
// logger.log('error', "127.0.0.1 - there's no place like home");
// logger.info("127.0.0.1 - there's no place like home");
// logger.warn("127.0.0.1 - there's no place like home");
// logger.error("127.0.0.1 - there's no place like home");
