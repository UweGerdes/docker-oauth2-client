/**
 * @module lib:helpers
 * @private
 */

'use strict';

const gulpNotify = require('gulp-notify');

/**
 * log only to console, not GUI
 *
 * @param {pbject} options - setting options
 * @param {function} callback - gulp callback
 */
module.exports = gulpNotify.withReporter((options, callback) => {
  callback();
});
