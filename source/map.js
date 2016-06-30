/**
 * Map like constructor. Mapping will attempt to delegate to native map if
 * supported.
 */
var Mapping = (function (root) {

  /**
   * Can we use native maps?
   *
   * @type {Boolean}
   */
  var NATIVE_MAP_SUPPORTED = 'Map' in global;

  /**
   * A thin and very incomplete map implementation for environments that
   * dont support native maps.
   */
  var Mapping = function () {
    var keys = [],
        values = [];

    /**
     * Iterates over key value pairs.
     *
     * @param {Function} fn
     */
    var forEach = function (fn) {
      keys.forEach(function (key, index) {
        fn(values[index], key);
      });
    };

    /**
     * Gets a value by key.
     *
     * @param  {*} key
     * @return {*}
     */
    var get = function (key) {
      return values[keys.indexOf(key)];
    };

    /**
     * Sets a value by key.
     *
     * @param {*} key
     * @param {*} value
     * @return {Mapping}
     */
    var set = function (key, value) {
      var index = keys.indexOf(key);

      if (index === -1) {
        keys.push(key);
        values.push(value);
      } else {
        keys[index] = key;
        values[index] = value;
      }

      return api;
    };

    /**
     * Determines the size of the mapping.
     *
     * @returns {Number}
     */
    var size = function () {
      return keys.length;
    };

    /**
     * Public api.
     *
     * @type {Object}
     */
    var api = {
      forEach: forEach,
      get: get,
      set: set
    };

    getter(api, 'size', size);

    return api;
  };

  return NATIVE_MAP_SUPPORTED
    ? global.Map
    : Mapping;
})(global);
