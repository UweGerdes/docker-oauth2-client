/**
 * Routes for boilerplate
 *
 * @module boilerplate/index
 */

'use strict';

const router = require('express').Router(); // eslint-disable-line new-cap

const controller = require('./controller.js');

// boilerplate overview
router.get('/', controller.index);

// boilerplate form
router.get('/form', controller.form);
router.post('/form', controller.form);

module.exports = {
  router: router
};
