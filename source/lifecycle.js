/**
 * Describes possible object lifecycles.
 *
 * @enum {String}
 */
var Lifecycle = {

  /**
   * Transient objects are created new every time its requested.
   *
   * @type {String}
   */
  TRANSIENT: 'TRANSIENT',

  /**
   * Singleton objects are only ever created once then cached.
   *
   * @type {String}
   */
  SINGLETON: 'SINGLETON',

  /**
   * Default lifecycle.
   *
   * @type {String}
   */
  DEFAULT: 'SINGLETON',

  /**
   * Parses a value to a valid enum type.
   *
   * @throws {Error} If unable to parse.
   *
   * @param  {String} value
   * @return {String}
   */
  parse: function (value) {
    var result = null;

    if (typeof value == 'string') {
      var name = value.toUpperCase();

      if (has.call(this, name) && typeof this[name] === 'string') {
        if (this[name] === name) {
          result = this[name];
        } else {
          result = this.parse(this[name]);
        }
      }
    }

    if (result == null) {
      throw new Error('Unable to parse ' + value + ' as Lifecycle.');
    }

    return result;
  }
};
