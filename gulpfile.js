/**
 * gulpfile for project motion
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 *
 * Gulp uses configuration variables stored in `./configuration.yaml`
 *
 * @name gulp
 * @module
 *
 */
'use strict';

require('./gulp/build');
require('./gulp/lint');
require('./gulp/server');
require('./gulp/tests');
require('./gulp/watch');

const gulp = require('gulp'),
  sequence = require('gulp-sequence'),
  config = require('./lib/config')
  ;

/**
 * #### default task
 *
 * start build and watch, some needed for changedInPlace dryrun
 *
 * @param {function} callback - gulp callback
 */
gulp.task('default', (callback) => {
  sequence(
    ...config.gulp.start[process.env.NODE_ENV].gulp,
    callback
  );
});
