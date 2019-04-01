const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());

require('./startup/routes')(app);
require('./startup/dbInit')();
require('./startup/validate')();
require('./startup/config')();
// require('./startup/rateLimiter')(app);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`Listening on port ${port}`));


module.exports = server;