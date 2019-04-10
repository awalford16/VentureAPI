const express = require('express');
const winston = require('winston');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/dbInit')();
require('./startup/validate')();
require('./startup/config')();
require('./startup/prod')(app);
// require('./startup/rateLimiter')(app);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => winston.info(`Listening on port ${port}`));


module.exports = server;