/**
 * ## HTTP-Server for motion
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
  app = express()
  ;

const httpPort = config.server.httpPort,
  docRoot = config.server.docroot,
  modulesRoot = config.server.modules,
  verbose = config.server.verbose
  ;

let modules = { };

/**
 * Weberver logging
 *
 * using log format starting with [time]
 */
if (verbose) {
  morgan.token('time', () => { // jscs:ignore jsDoc
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
app.use(express.static(docRoot));

/**
 * Route for root dir
 *
 * @param {Object} req - request
 * @param {Object} res - response
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(docRoot, 'index.html'));
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
glob.sync(modulesRoot + '/*/server/index.js')
  .forEach((filename) => { // jscs:ignore jsDoc
      const regex = new RegExp(modulesRoot + '(/[^/]+)/server/index.js');
      const baseRoute = filename.replace(regex, '$1');
      modules[baseRoute] = require('./' + path.join(modulesRoot, baseRoute, 'config.json'));
      app.use(baseRoute, require(filename)
    );
  }
);

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
  chalk.greenBright('http://' + ipv4addresses.get()[0] + ':' + httpPort));

app.listen(httpPort);

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
  return modulesRoot + '/pages/' + page + '/views/index.' + type;
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
    httpPort: httpPort,
    livereloadPort: livereloadPort,
    modules: modules
  };
}
