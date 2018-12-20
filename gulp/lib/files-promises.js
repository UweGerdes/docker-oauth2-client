/**
 * @module lib:files-promises
 * @private
 */
'use strict';

const fs = require('fs'),
  glob = require('glob')
  ;

// execute only one test file if one has changed in recentTime, otherwise all
const recentTime = 60; // * 60;

/**
 * get list of files for glob pattern
 *
 * @private
 * @param {function} path - patterns for paths
 */
const getFilenames = (path) => {
  return new Promise((resolve, reject) => { // jscs:ignore jsDoc
    glob(path, (error, files) => { // jscs:ignore jsDoc
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
};

/**
 * get newest file from glob list - synchronous
 *
 * @param {array} files - list with glob paths
 */
function getRecentFiles(files) {
  let newest = null;
  let bestTime = 0;
  for (let i = 0; i < files.length; i++) {
    const fileTime = fs.statSync(files[i]).mtime.getTime();
    if (fileTime > bestTime) {
      newest = files[i];
      bestTime = fileTime;
    }
  }
  const now = new Date();
  if (now.getTime() - bestTime < recentTime * 1000) {
    return new Promise((resolve) => { // jscs:ignore jsDoc
      resolve([newest]);
    });
  } else {
    return new Promise((resolve) => { // jscs:ignore jsDoc
      resolve(files);
    });
  }
}

/**
 * Get the file content
 *
 * @private
 * @param {function} filename - to open
 */
const getFileContent = (filename) => {
  return new Promise((resolve, reject) => { // jscs:ignore jsDoc
    fs.readFile(filename, (error, data) => { // jscs:ignore jsDoc
      if (error) {
        reject(error);
      } else {
        resolve({ filename: filename, content: data.toString() });
      }
    });
  });
};

module.exports = {
  getFilenames: getFilenames,
  getRecentFiles: getRecentFiles,
  getFileContent: getFileContent
};
