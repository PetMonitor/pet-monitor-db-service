const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint, colorize, errors, } = format;

// instantiate a new Winston Logger with the settings defined above
var logger = createLogger({
  transports: [
    new transports.File({
        level: 'debug',
        filename: `/usr/src/app/logs/app.log`,
        handleExceptions: true,
        json: false,
        maxFiles: 10,
        colorize: true,
    }),
    new transports.Console({
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    })
  ],
  format: combine(
    errors({ stack: true }),
    colorize(),
    timestamp(),
    prettyPrint()
  ),
  exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;