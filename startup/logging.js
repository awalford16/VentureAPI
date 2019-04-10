const winston = require('winston');

module.exports = function() {
    // On exceptions print to console and save to file
    winston.handleExceptions(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: 'logs/uncaughtExceptions.log' })
    );

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });

    winston.add(winston.transports.File, { filename: 'logs/logfile.log' });
}