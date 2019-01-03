/**
 * ## Controller for login
 *
 * @module login/controller
 */

'use strict';

const axios = require('axios'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  path = require('path'),
  config = require('../../../lib/config'),
  model = require('./model.js');

const viewBase = path.join(path.dirname(__dirname), 'views');

const runRedirect = false;

const moduleConfig = yaml.safeLoad(
  fs.readFileSync(path.join(__dirname, '..', 'configuration.yaml'), 'utf8')
);

const viewRenderParams = {
  // model data
  // view helper functions
};

/**
 * ### index page
 *
 * render the index page
 *
 * @param {object} req - request
 * @param {object} res - result
 */
const index = (req, res) => {
  let data = Object.assign({
    title: 'Login'
  },
  req.params,
  getHostData(req),
  viewRenderParams,
  model.getData());
  res.render(path.join(viewBase, 'index.pug'), data);
};

/**
 * ### callback page
 *
 * render the callback page
 *
 * @param {object} req - request
 * @param {object} res - result
 */
const callback = (req, res) => {
  const requestToken = req.query.code;
  if (runRedirect) {
    axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?client_id=${moduleConfig.oauth2.GitHub.clientID}&client_secret=${moduleConfig.oauth2.GitHub.clientSecret}&code=${requestToken}`,
      headers: {
        accept: 'application/json'
      }
    }).then((response) => {
      const accessToken = response.data.access_token;
      console.log(accessToken);
      res.redirect(`/welcome.html?access_token=${accessToken}`);
    });
  } else {
    let data = Object.assign({
      title: 'callback'
    },
    req.params,
    getHostData(req),
    viewRenderParams,
    model.getData());
    res.render(path.join(viewBase, 'callback.pug'), data);
  }
};

/**
 * ### welcome page
 *
 * render the welcome page
 *
 * @param {object} req - request
 * @param {object} res - result
 */
const welcome = (req, res) => {
  let data = Object.assign({
    title: 'welcome'
  },
  req.params,
  getHostData(req),
  viewRenderParams,
  model.getData());
  res.render(path.join(viewBase, 'welcome.pug'), data);
};

module.exports = {
  index: index,
  callback: callback,
  welcome: welcome
};

/**
 * Get the host data for livereload
 *
 * @private
 * @param {String} req - request
 */
function getHostData(req) {
  let livereloadPort = config.server.livereloadPort || process.env.LIVERELOAD_PORT;
  const host = req.get('Host');
  if (host.indexOf(':') > 0) {
    livereloadPort = parseInt(host.split(':')[1], 10) + 1;
  }
  return {
    environment: process.env.NODE_ENV,
    hostname: req.hostname,
    livereloadPort: livereloadPort,
    module: moduleConfig
  };
}
