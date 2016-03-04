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
    this._keys = [];
    this._values = [];
  };

  /**
   * Map prototype.
   */
  Mapping.prototype = {

    /**
     * Gets a single value from the map.
     *
     * @param  {T} key
     * @return {U}
     */
    get: function (key) {
      return this._values[this._keys.indexOf(key)];
    },

    /**
     * Sets a single value from the map.
     *
     * @param  {T} key   [description]
     * @param  {U} value [description]
     * @return {Map}       [description]
     */
    set: function (key, value) {
      var index = this._keys.indexOf(key);

      if (index === -1) {
        this._keys.push(key);
        this._values.push(value);
      } else {
        this._keys[index] = key;
        this._values[index] = value;
      }

      return this;
    }
  };

  return NATIVE_MAP_SUPPORTED
    ? global.Map
    : Mapping;
})(global);
