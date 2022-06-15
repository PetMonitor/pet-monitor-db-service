const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint, colorize, errors, } = format;

// instantiate a new Winston Logger with the settings defined above
var logger;

const consoleTransport = new transports.Console({
  name: 'console',
  level: 'debug',
  handleExceptions: true,
  json: false,
  colorize: true,
})


if (process.env.NODE_ENV !== 'test') {
  logger = createLogger({
    transports: [
      new transports.File({
        name: 'file',
        level: 'debug',
        filename: `/usr/src/app/logs/app.log`,
        handleExceptions: true,
        json: false,
        maxFiles: 10,
        colorize: true,
      }),
      consoleTransport
    ],
    format: combine(
      errors({ stack: true }),
      colorize(),
      timestamp(),
      prettyPrint()
    ),
    exitOnError: false, // do not exit on handled exceptions
  });
} else {
  logger = createLogger({
    transports: [
      consoleTransport
    ],
    format: combine(
      errors({ stack: true }),
      colorize(),
      timestamp(),
      prettyPrint()
    ),
    exitOnError: false, // do not exit on handled exceptions
  });
}


module.exports = logger;