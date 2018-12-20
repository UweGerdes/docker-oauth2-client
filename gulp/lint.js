/**
 * @module gulp/lint
 */
'use strict';

const gulp = require('gulp'),
  changedInPlace = require('gulp-changed-in-place'),
  jscs = require('gulp-jscs'),
  jscsStylish = require('gulp-jscs-stylish'),
  gulpJshint = require('gulp-jshint'),
  jsonlint = require('gulp-jsonlint'),
  lesshint = require('gulp-lesshint'),
  notify = require('gulp-notify'),
  pugLinter = require('gulp-pug-linter'),
  sequence = require('gulp-sequence'),
  yamlValidate = require('gulp-yaml-validate'),
  jshint = require('jshint').JSHINT,
  config = require('../lib/config'),
  filePromises = require('./lib/files-promises'),
  loadTasks = require('./lib/load-tasks')
  ;

/**
 * log only to console, not GUI
 *
 * @param {pbject} options - setting options
 * @param {function} callback - gulp callback
 */
const log = notify.withReporter((options, callback) => {
  callback();
});

const tasks = {
  /**
   * ### Default gulp lint task
   *
   * @task lint
   * @namespace tasks
   * @param {function} callback - gulp callback
   */
  'lint': (callback) => {
    sequence(
      ...config.gulp.start[process.env.NODE_ENV].lint,
      callback
    );
  },
  /**
   * #### Lint js files
   *
   * apply jshint and jscs to js files
   *
   * @task jshint
   * @namespace tasks
   */
  'jshint': () => {
    return gulp.src(config.gulp.watch.jshint)
      .pipe(changedInPlace({ howToDetermineDifference: 'modification-time' }))
      .pipe(log({ message: 'linted: <%= file.path %>', title: 'Gulp jshint' }))
      .pipe(gulpJshint())
      .pipe(jscs())
      .pipe(jscsStylish.combineWithHintResults())
      .pipe(gulpJshint.reporter('default'))
      .pipe(gulpJshint.reporter('fail'))
      //.pipe(gulpJshint.reporter('jshint-stylish'))
      ;
  },
  /**
   * #### Lint json files
   *
   * apply lesshint json files
   *
   * @task jsonlint
   * @namespace tasks
   */
  'jsonlint': () => {
    return gulp.src(config.gulp.watch.jsonlint)
      .pipe(jsonlint())
      .pipe(jsonlint.reporter())
      ;
  },
  /**
   * #### Lint less files
   *
   * apply lesshint to less files
   *
   * @task lesshint
   * @namespace tasks
   */
  'lesshint': () => {
    return gulp.src(config.gulp.watch.lesshint)
      .pipe(lesshint())
      .on('error', function () {})
      .pipe(lesshint.reporter())
      ;
  },
  /**
   * #### Lint yaml files
   *
   * apply yamlValidate to yaml files
   *
   * @task yamllint
   * @namespace tasks
   */
  'yamllint': () => {
    return gulp.src(config.gulp.watch.yamllint)
      .pipe(yamlValidate({ space: 2 }))
      .on('error', (msg) => { // jscs:ignore jsDoc
        console.log(msg);
      })
      ;
  },
  /**
   * #### Lint pug files
   *
   * apply pug-linter to pug files
   *
   * @task puglint
   * @namespace tasks
   */
  'puglint': () => {
    return gulp.src(config.gulp.watch.puglint)
      .pipe(pugLinter())
      .pipe(pugLinter.reporter('fail'))
      ;
  },
  /**
   * #### Lint ejs files
   *
   * validate ejs files
   * - replace `<%=`, `<%-` tags with output = [expression];
   * - strip non ejs html and `<%` and `%>`
   * - keep lines for counting
   *
   * options are supplied here - TODO use .ejslintrc
   *
   * @task ejslint
   * @namespace tasks
   * @param {function} callback - gulp callback
   */
  'ejslint': (callback) => {
    Promise.all(config.gulp.watch.ejslint.map(filePromises.getFilenames))
    .then((filenames) => [].concat(...filenames)) // jscs:ignore jsDoc
    .then((filenames) => { // jscs:ignore jsDoc
      return Promise.all(
        filenames.map(filePromises.getFileContent)
      );
    })
    .then((files) => { // jscs:ignore jsDoc
      return Promise.all(
        files.map(replaceOutputTags)
      );
    })
    .then((files) => { // jscs:ignore jsDoc
      return Promise.all(
        files.map(replaceEjsTags)
      );
    })
    .then((files) => { // jscs:ignore jsDoc
      return Promise.all(
        files.map(fileJsHint)
      );
    })
    .then((files) => { // jscs:ignore jsDoc
      return Promise.all(
        files.map(report)
      );
    })
    .then(() => { // jscs:ignore jsDoc
      callback();
    })
    ;
  }
};

// some Promises for ejslint

/**
 * Replace expression output tags
 *
 * @private
 * @param {function} file - file object with contents
 */
const replaceOutputTags = (file) => {
  return new Promise((resolve) => { // jscs:ignore jsDoc
    file.noOutput = '<% var output, output_raw; %>' + file.content
      .replace(/<%= *(.+?) *%>/g, '<% output = $1; %>')
      .replace(/<%- *(.+?) *%>/g, '<% output_raw = $1; %>');
    resolve(file);
  });
};

/**
 * Replace html outside of ejs tags with returns
 *
 * @private
 * @param {function} file - file object with contents
 */
const replaceEjsTags = (file) => {
  return new Promise((resolve) => { // jscs:ignore jsDoc
    let parts = file.noOutput.split(/<%/);
    let output = [];
    parts.forEach((part) => { // jscs:ignore jsDoc
      let snips = part.split(/%>/);
      output.push(snips[0]);
      output.push(snips.join('%>').replace(/[^\n]/g, ''));
    });
    file.jsCode = output.join('');
    resolve(file);
  });
};

/**
 * jshint the remaining content
 *
 * @private
 * @param {function} file - file object with contents
 */
const fileJsHint = (file) => {
  return new Promise((resolve) => { // jscs:ignore jsDoc
    jshint(file.jsCode, { esversion: 6, asi: true }, { });
    if (jshint.errors) {
      file.errors = jshint.errors;
    }
    file.jshint = jshint.data();
    resolve(file);
  });
};

/**
 * report errors
 *
 * @private
 * @param {function} file - file object with contents
 */
const report = (file) => {
  return new Promise((resolve) => { // jscs:ignore jsDoc
    if (file.jshint.errors) {
      console.log('ERRORS in ' + file.filename);
      file.jshint.errors.forEach((error) => { // jscs:ignore jsDoc
        console.log('ERROR: ' + error.line + '/' + error.character + ' ' + error.reason);
      });
    }
    resolve(file);
  });
};

if (process.env.NODE_ENV == 'development') {
  loadTasks.importTasks(tasks);
} else {
  loadTasks.importTasks({ jshint: () => { } }); // jscs:ignore jsDoc
}
