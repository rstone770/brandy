/**!
 * brandy 1.0.0 - A tiny IoC container.
 * http://www.github.com/rstone770/brandy
 *
 * Licensed MIT
 */
;(function(global) {
"use strict";

/**
 * IoC container.
 *
 * @param {Mapping} map
 */
var Container = function (map) {

  /**
   * Internal cache for singleton instances.
   *
   * @type {Object}
   */
  var cache = {};

  /**
   * Binds a implementation to a type.
   *
   * @param  {*} type
   * @param  {Function} implementation
   * @param  {Object=} options
   * @return {Container}
   */
  var bind = function (type, implementation, options) {
    var bindingOptions = options || {},
        dependencies = bindingOptions.dependencies || [],
        lifecycle = bindingOptions.lifecycle;

    if (typeof implementation !== 'function') {
      throw new TypeError('Implementation must be a constructor.');
    }

    if (dependencies.constructor !== Array) {
      throw new TypeError('Dependencies must be an array.');
    }

    return factory(type, asFactory(implementation, slice.call(dependencies)), lifecycle);
  };

  /**
   * Binds a factory to a type.
   *
   * @param  {*} type
   * @param  {Function(container: Container): *} factory
   * @param  {Lifecycle} lifecycle
   * @return {Container}
   */
  var factory = function (type, factory, lifecycle) {
    if (typeof factory !== 'function') {
      throw new TypeError('Factory must be a function.');
    }

    if (lifecycle != null && typeof lifecycle !== 'string') {
      throw new TypeError('Lifecycle must be a string.');
    }

    map.set(type, {
      factory: factory,
      id: uid(),
      lifecycle: Lifecycle.parse(lifecycle || Lifecycle.DEFAULT),
      pending: false
    });

    return api;
  };

  /**
   * Returns an instance bound to T. If the strict boolean is set, the return instance
   * must be a non null or undefined value.
   *
   * @throws {Error} If dependency could not be resolved.
   * @throws {Error} If a circular dependency is detected.
   * @throws {Error} If an unsupported lifecycle is defined.
   * @throws {Error} If strict is set, but the return instance did not reutrn a valid instance.
   *
   * @param  {*} type
   * @param  {Boolean=} strict
   * @return {*}
   */
  var instance = function (type, strict) {
    var descriptor = map.get(type),
        instance = null;

    if (descriptor == null) {
      throw new Error('Dependency ' + typeToString(type) + ' could not be resolved because it has not been registered.');
    }

    var id = descriptor.id,
        lifecycle = descriptor.lifecycle;

    if (descriptor.pending === true) {
      throw new Error('Circular dependency detected while resolving ' + typeToString(type, id) + '.');
    }

    descriptor.pending = true;

    try {
      switch (lifecycle) {
        case Lifecycle.SINGLETON:
          instance = asSingleton(descriptor);
          break;
        case Lifecycle.TRANSIENT:
          instance = asTransient(descriptor);
          break;
        default:
          throw new Error('Unsupported lifecycle ' + lifecycle + '.');
      }
    } finally {
      descriptor.pending = false;
    }

    if (instance == null && strict) {
      throw new Error(typeToString(type, id) + ' failed to return a value in strict mode.');
    }

    return instance;
  };

  /**
   * Returns a singleton instance.
   *
   * @param  {Object} descriptor
   * @return {*}
   */
  var asSingleton = function (descriptor) {
    var id = descriptor.id;

    if (cache[id] == null) {
      cache[id] = asTransient(descriptor);
    }

    return cache[id];
  };

  /**
   * Creates a new instance.
   *
   * @param  {Object} descriptor
   * @return {*}
   */
  var asTransient = function (descriptor) {
    return descriptor.factory(api);
  };

  /**
   * Creates a formated string from a type and id.
   *
   * @param  {*} type
   * @param  {String=} uid
   * @return {String}
   */
  var typeToString = function (type, uid) {
    var result = type;

    if (uid != null) {
      result += '(' + uid + ')';
    }

    return result;
  };

  var api = {
    bind: bind,
    factory: factory,
    instance: instance
  };

  return api;
};

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
brandy.version = '1.0.0';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return factory;
    });
  } else if (typeof exports === 'object' && module.exports) {
    module.exports = factory;
  } else {
    global.Brandy = brandy;
  }
})(global, brandy);

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
    if (typeof value == 'string') {
      var name = value.toUpperCase();

      if (has.call(Lifecycle, name) && typeof Lifecycle[name] === 'string') {
        return Lifecycle[name];
      }
    }

    throw new Error('Unable to parse ' + value + ' as Lifecycle.');
  }
};

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
     * Public api.
     *
     * @type {Object}
     */
    var api = {
      get: get,
      set: set
    };

    return api;
  };

  return NATIVE_MAP_SUPPORTED
    ? global.Map
    : Mapping;
})(global);
}(this));
