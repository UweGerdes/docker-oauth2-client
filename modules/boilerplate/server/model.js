/**
 * ## Model for boilerplate
 *
 * @module boilerplate/model
 */

'use strict';

let data = { modelData: 'boilerplate data' };

module.exports = {
  /**
   * get data
   *
   * @returns {object} model data
   */
  getData: () => {
    return data;
  }
};
