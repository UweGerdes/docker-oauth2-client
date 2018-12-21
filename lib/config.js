/**
 * @module lib:config
 * @private
 */

'use strict';

const fs = require('fs'),
  yaml = require('js-yaml'),
  path = require('path');

/**
 * Parse config for all modules
 *
 * @private
 */
const config = yaml.safeLoad(
  fs.readFileSync(path.join(__dirname, '..', 'configuration.yaml'), 'utf8')
);

module.exports = {
  /**
   * Exports config
   */
  config: config,
  /**
   * Exports gulp
   */
  gulp: config.gulp,
  /**
   * Exports server
   */
  server: config.server
};
