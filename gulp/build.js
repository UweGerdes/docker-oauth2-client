/**
 * @module gulp/build
 */

'use strict';

const gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  jsdoc = require('gulp-jsdoc3'),
  less = require('gulp-less'),
  mergeTranslations = require('gulp-merge-translations'),
  rename = require('gulp-rename'),
  sequence = require('gulp-sequence'),
  gulpStreamToPromise = require('gulp-stream-to-promise'),
  lessPluginGlob = require('less-plugin-glob'),
  combiner = require('stream-combiner2'),
  config = require('../lib/config'),
  filePromises = require('./lib/files-promises'),
  loadTasks = require('./lib/load-tasks'),
  notify = require('./lib/notify');

const tasks = {
  /**
   * ### Default gulp build task
   *
   * @task build
   * @namespace tasks
   * @param {function} callback - gulp callback
   */
  'build': (callback) => {
    sequence(
      ...config.gulp.start[process.env.NODE_ENV].build,
      callback
    );
  },
  /**
   * #### Compile less files
   *
   * compile less files
   *
   * @task less
   * @namespace tasks
   */
  'less': [['lesshint'], () => {
    return combiner.obj([
      gulp.src(config.gulp.build.less.src),
      less({
        plugins: [lessPluginGlob]
      }),
      autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'),
      gulp.dest(config.gulp.build.less.dest),
      notify({ message: 'written: <%= file.path %>', title: 'Gulp less' })
    ])
      .on('error', () => { });
  }],
  /**
   * #### Compile js files
   *
   * compile js files
   *
   * @task jsss
   * @namespace tasks
   */
  'js': [['eslint'], (callback) => {
    Promise.all(config.gulp.build.js.src.map(filePromises.getFilenames))
      .then((filenames) => [].concat(...filenames))
      .then(filePromises.getRecentFiles)
      .then((filenames) => {
        const promises = [];
        for (const filename of filenames) {
          promises.push(gulpStreamToPromise(
            gulp.src(filename)
              .pipe(rename(function (path) {
                Object.keys(config.gulp.build.js.replace).forEach((key) => {
                  path.dirname = filename.replace(new RegExp(key), config.gulp.build.js.replace[key]);
                });
              }))
              .pipe(gulp.dest(config.gulp.build.js.dest))
              .pipe(notify({ message: 'written: <%= file.path %>', title: 'Gulp js' }))
          ));
        }
        return Promise.all(promises);
      })
      .then(() => {
        callback();
      })
      .catch(err => console.log(err));
  }],
  /**
   * #### Compile locales files
   *
   * compile locales files
   *
   * @task locales
   * @namespace tasks
   */
  'locales': [['localesjsonlint'], () => {
    return gulp.src(config.gulp.watch.locales)
      .pipe(mergeTranslations('', {
        sep: '',
        jsonSpace: '  '
      }))
      .pipe(gulp.dest(config.gulp.build.locales.dest))
      .pipe(notify({ message: 'written: <%= file.path %>', title: 'Gulp locales' }));
  }],
  /**
   * #### Compile jsdoc
   *
   * compile jsdoc
   *
   * @task jsdoc
   * @namespace tasks
   * @param {function} callback - gulp callback
   */
  'jsdoc': [['eslint'], (callback) => {
    const jsdocConfig = {
      'tags': {
        'allowUnknownTags': true
      },
      'opts': {
        'destination': config.gulp.build.jsdoc.dest
      },
      'plugins': [
        'plugins/markdown'
      ],
      'templates': {
        'cleverLinks': false,
        'monospaceLinks': false,
        'default': {
          'outputSourceFiles': 'true'
        },
        'path': 'ink-docstrap',
        'theme': 'cerulean',
        'navType': 'vertical',
        'linenums': true,
        'dateFormat': 'D.MM.YY, HH:mm:ss'
      }
    };
    gulp.src(config.gulp.build.jsdoc.src, { read: false })
      .pipe(jsdoc(jsdocConfig, callback));
  }]
};

loadTasks.importTasks(tasks);
