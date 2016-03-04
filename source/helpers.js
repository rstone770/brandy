/**
 * Creates a container compatible factory from a constructor of type T.
 *
 * @param  {T} T
 * @param  {Array} dependencies
 * @return {Function}
 */
var asFactory = function (T, dependencies) {
  return function (container) {
    return construct(T, dependencies.map(function (dependency) {
      return container.instance(dependency);
    }));
  };
};

/**
 * Creates a new object from its constructor.
 *
 * @param  {T} T
 * @param  {Array=} params
 * @return {T}
 */
var construct = function (T, params) {
  return new (Function.bind.apply(T, [null].concat(params)))();
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
