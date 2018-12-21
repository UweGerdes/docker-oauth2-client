/**
 * Routes for boilerplate
 *
 * @module boilerplate/index
 */

'use strict';

const express = require('express'),
  router = express.Router();

const controller = require('./controller.js');

// boilerplate overview
router.get('/', controller.index);

module.exports = router;
