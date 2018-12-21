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

module.exports = router;
