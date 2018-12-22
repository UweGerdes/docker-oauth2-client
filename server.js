/**
 * ## HTTP-Server for boilerplate
 *
 * @module server
 */

'use strict';

const bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  chalk = require('chalk'),
  dateFormat = require('dateformat'),
  express = require('express'),
  glob = require('glob'),
  morgan = require('morgan'),
  path = require('path'),
  config = require('./lib/config'),
  ipv4addresses = require('./lib/ipv4addresses'),
  log = require('./lib/log'),
  app = express();

let modules = { };

/**
 * Weberver logging
 *
 * using log format starting with [time]
 */
if (config.server.verbose) {
  morgan.token('time', () => {
    return dateFormat(new Date(), 'HH:MM:ss');
  });
  app.use(morgan('[' + chalk.gray(':time') + '] ' +
    ':method :status :url :res[content-length] Bytes - :response-time ms'));
}

// base directory for views
app.set('views', __dirname);

// render ejs files
app.set('view engine', 'ejs');

// work on post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// work on cookies
app.use(cookieParser());

// Serve static files
app.use(express.static(config.server.docroot));

/**
 * Route for root dir
 *
 * @param {Object} req - request
 * @param {Object} res - response
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(config.server.docroot, 'index.html'));
});

/**
 * Route for app main page
 *
 * @param {Object} req - request
 * @param {Object} res - response
 */
app.get('/app', (req, res) => {
  res.render(viewPath('app'), getHostData(req));
});

/**
 * Routes from modules
 */
glob.sync(config.server.modules + '/*/server/index.js')
  .forEach((filename) => {
    const regex = new RegExp(config.server.modules + '(/[^/]+)/server/index.js');
    const baseRoute = filename.replace(regex, '$1');
    modules[baseRoute] = require('./' + path.join(config.server.modules, baseRoute, 'config.json'));
    app.use(baseRoute, require(filename));
  });

/**
 * Route for everything else
 *
 * @param {Object} req - request
 * @param {Object} res - response
 */
app.get('*', (req, res) => {
  res.status(404).render(viewPath('404'), getHostData(req));
});

// Fire it up!
log.info('server listening on ' +
  chalk.greenBright('http://' + ipv4addresses.get()[0] + ':' + config.server.httpPort));

app.listen(config.server.httpPort);

/**
 * Handle server errors
 *
 * @param {Object} err - error
 * @param {Object} req - request
 * @param {Object} res - response
 * @param {Object} next - needed for complete signature
 */
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  if (err) {
    res.status(500)
      .render(viewPath('500'), Object.assign({ error: err }, getHostData(req)));
  } else {
    next();
  }
});

/**
 * Get the path for file to render
 *
 * @private
 * @param {String} page - page type
 * @param {String} type - file type (ejs, jade, pug, html)
 */
function viewPath(page = '404', type = 'ejs') {
  return config.server.modules + '/pages/' + page + '/views/index.' + type;
}

/**
 * Get the host data for ports and modules
 *
 * @private
 * @param {String} req - request
 */
function getHostData(req) {
  let livereloadPort = config.server.livereloadPort;
  const host = req.get('Host');
  if (host.indexOf(':') > 0) {
    livereloadPort = parseInt(host.split(':')[1], 10) + 1;
  }
  return {
    hostname: req.hostname,
    httpPort: config.server.httpPort,
    livereloadPort: livereloadPort,
    modules: modules
  };
}
