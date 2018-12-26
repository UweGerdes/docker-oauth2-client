/**
 * ## Gulp server tasks
 *
 * @module gulp/server
 */

'use strict';

const gulp = require('gulp'),
  changedInPlace = require('gulp-changed-in-place'),
  server = require('gulp-develop-server'),
  livereload = require('gulp-livereload'),
  sequence = require('gulp-sequence'),
  config = require('../lib/config'),
  ipv4addresses = require('../lib/ipv4addresses.js'),
  loadTasks = require('./lib/load-tasks'),
  log = require('../lib/log'),
  notify = require('./lib/notify');


const tasks = {
  /**
   * ### server start
   *
   * @task server
   * @namespace tasks
   * @param {function} callback - gulp callback
   */
  'server': [['eslint'], (callback) => {
    sequence(
      ...config.gulp.start[process.env.NODE_ENV].server,
      callback
    );
  }],
  /**
   * ### server start task
   *
   * @task server-start
   * @namespace tasks
   * @param {function} callback - gulp callback
   */
  'server-start': (callback) => {
    server.listen({
      path: config.server.server,
      env: { VERBOSE: true, FORCE_COLOR: 1 }
    },
    callback);
  },
  /**
   * ### server changed task
   *
   * @task server-changed
   * @namespace tasks
   * @param {function} callback - gulp callback
   */
  'server-changed': (callback) => {
    server.changed((error) => {
      if (!error) {
        livereload.changed({ path: '/', quiet: false });
      }
      callback();
    });
  },
  /**
   * ### server livereload task
   *
   * @task livereload
   * @namespace tasks
   */
  'livereload': () => {
    return gulp.src(config.gulp.watch.livereload)
      .pipe(changedInPlace({ howToDetermineDifference: 'modification-time' }))
      .pipe(notify({ message: '<%= file.path %>', title: 'livereload' }))
      .pipe(livereload({ quiet: true }));
  },
  /**
   * ### trigger of livereload task with first file
   *
   * @task livereload-index
   * @namespace tasks
   */
  'livereload-index': () => {
    return gulp.src(config.gulp.watch.livereload[0])
      .pipe(notify({ message: 'triggered', title: 'livereload' }))
      .pipe(livereload({ quiet: true }));
  },
  /**
   * ### server livereload start task
   *
   * @task livereload-start
   * @namespace tasks
   */
  'livereload-start': () => {
    livereload.listen({
      port: config.server.livereloadPort || process.env.LIVERELOAD_PORT,
      delay: 2000,
      quiet: false
    });
    log.info('livereload listening on http://' +
      ipv4addresses.get()[0] + ':' + config.server.livereloadPort);
  }
};

loadTasks.importTasks(tasks);
