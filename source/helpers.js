/**
 * Creates a container compatible factory from a constructor of type T.
 *
 * @param  {Function} constructor
 * @param  {Array} dependencies
 * @return {Function}
 */
var asFactory = function (constructor, dependencies) {
  return function (container) {
    return construct(constructor, dependencies.map(function (dependency) {
      return container.instance(dependency);
    }));
  };
};

/**
 * Creates a new object from its constructor.
 *
 * @param  {Function} constructor
 * @param  {Array=} params
 * @return {Object}
 */
var construct = function (constructor, params) {
  return new (Function.bind.apply(constructor, [null].concat(params)))();
};

/**
 * Create a unique id for a dependency;
 *
 * @return {String}
 */
var uid = (function () {
  var uid = 0;

  var next = function () {
    return ':' + uid++;
  };

  return next;
})();

/**
 * Slice array shortcut.
 *
 * @type {Function}
 */
var slice = Array.prototype.slice;

/**
 * Has own property shortcut.
 *
 * @type {Function}
 */
var has = Object.prototype.hasOwnProperty;
