(function(Log) {
  var path = require('path');
  var fs = require('fs');
  Log.path = path.resolve('logs');
  if (!fs.existsSync(Log.path)){
    fs.mkdirSync(Log.path);
  }
  var DEBUG = process.env.NODE_ENV !== 'production';
  var winston = require('winston');
  winston.emitErrs = true;

  var apiAccessTransports = new winston.transports.File({
      level: 'info',
      filename: logFileName('api-access'),
      handleExceptions: false,
      json: true,
      maxsize: 1024*1024*10, //5MB
      maxFiles: 10000,
      colorize: false
    });

  var businessTransports = new winston.transports.File({
      level: 'info',
      filename: logFileName('business'),
      handleExceptions: false,
      json: true,
      maxsize: 1024*1024*10, //5MB
      maxFiles: 10000,
      colorize: false
    });

  var exceptionTransports = new winston.transports.File({
      level: 'info',
      filename: logFileName('exception'),
      handleExceptions: false,
      json: true,
      maxsize: 1024*1024*10, //5MB
      maxFiles: 10000,
      colorize: false
    });

  var errorTransport = new winston.transports.File({
      filename: logFileName('error'),
      handleExceptions: false,
      json: true,
      maxsize: 1024*1024*10, //5MB
      maxFiles: 10000,
      colorize: false
    });

  var consoleTransports = new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: true,
      colorize: true
    });

  function logFileName(type) {
    return Log.path + '/' + type + '-' + new Date().toISOString().slice(0, 10) + '.log';
  }

  var business  = DEBUG ? [businessTransports, consoleTransports] : [businessTransports];
  var exception = DEBUG ? [exceptionTransports, consoleTransports] : [exceptionTransports];
  var apiAccess = DEBUG ? [apiAccessTransports, consoleTransports] : [apiAccessTransports];

  exports.b = new winston.Logger({
    transports: business,
    exceptionHandlers: [errorTransport],
    exitOnError: true
  });

  exports.e = new winston.Logger({
    transports: exception,
    exceptionHandlers: [errorTransport],
    exitOnError: true
  });

  var api = new winston.Logger({
    transports: apiAccess,
    exceptionHandlers: [errorTransport],
    exitOnError: true
  });

  // log access api for morgan stream
  Log.stream = {
      write: function(message, encoding){
          api.info(message);
      }
  };

  Log.error = function(message, err){
    if(err){
      if(Array.isArray(err)){
        message += ', ' + err.join(',');
      }
      if(err.message){
        message += ', ' + err.message;
      }
      if(err.stack){
        message += ', ' + err.stack;
      }
      if(typeof err === 'string') {
        message +=': ' + err;
      }
    }
    exports.b.log('error', message);
  }

  Log.info = function(message){
    exports.b.log('info', message);
  }
})(exports);
