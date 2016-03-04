var pkg = require('./package.json'),
    path = require('path');

/**
 * Config file that will be passed to all loaded gulp tasks.
 *
 * @type {Object}
 */
var config = {

  /**
   * Binary path.
   *
   * @type {String}
   */
  bin: path.join(__dirname, './bin'),

  /**
   * Package.json content.
   *
   * @type {Object}
   */
  package: pkg,

  /**
   * Source path.
   *
   * @type {String}
   */
  source: path.join(__dirname, './source'),

  /**
   * Tasks path.
   *
   * @type {String}
   */
  tasks: path.join(__dirname, './gulp'),

  /**
   * Tests path.
   *
   * @type {String}
   */
  tests: path.join(__dirname, './tests')
};

module.exports = config;
