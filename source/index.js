/**
 * Brandy factory.
 *
 * @return {Container}
 */
var brandy = function () {
  return new Container(new Mapping());
};

/**
 * Brandy build version.
 *
 * @type {String}
 */
brandy.version = '<%= version %>';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return factory;
    });
  } else if (typeof exports === 'object' && module.exports) {
    module.exports = factory;
  } else {
    global.Brandy = factory;
  }
})(global, brandy);
