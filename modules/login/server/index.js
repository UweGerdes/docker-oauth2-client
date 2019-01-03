/**
 * Routes for login
 *
 * @module login/index
 */

'use strict';

const router = require('express').Router(); // eslint-disable-line new-cap

const controller = require('./controller.js');

// login overview
router.get('/', controller.index);
router.get('/callback', controller.callback);
router.get('/welcome', controller.welcome);

module.exports = {
  router: router,
  setExpress: controller.setExpress
};
