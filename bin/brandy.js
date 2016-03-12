/**!
 * brandy 1.0.0 - A tiny IoC container.
 * http://www.github.com/rstone770/brandy
 *
 * Licensed MIT
 */
;(function(global) {
"use strict";

/**
 * Creates a formated string from a type and id.
 *
 * @param  {T} T
 * @param  {String} uid
 * @return {String}
 */
var formatTypeString = function (T, uid) {
  var string = T;

  if (uid != null) {
    string += '(' + uid + ')';
  }

  return string;
};

/**
 * IoC container.
 *
 * @param {Mapping} map
 */
var Container = function (map) {
  this._map = map;
  this._cache = {};
};

/**
 * IoC prototype.
 */
Container.prototype = {

  /**
   * Binds a implementation to a type.
   *
   * @param  {T} T
   * @param  {U} implementation
   * @param  {Object=} options
   * @return {Container}
   */
  bind: function (T, implementation, options) {
    var bindingOptions = options || {},
        dependencies = bindingOptions.dependencies || [],
        lifecycle = bindingOptions.lifecycle;

    if (typeof implementation !== 'function') {
      throw new TypeError('Implementation must be a constructor.');
    }

    if (dependencies.constructor !== Array) {
      throw new TypeError('Dependencies must be an array.');
    }

    return this.factory(T, asFactory(implementation, slice.call(bindingOptions.dependencies)), lifecycle);
  },

  /**
   * Binds a factory to a type.
   *
   * @param  {T} T
   * @param  {Function(container: Container): U} factory
   * @param  {Lifecycle} lifecycle
   * @return {Container}
   */
  factory: function (T, factory, lifecycle) {
    if (typeof factory !== 'function') {
      throw new Error('Factory must be a function.');
    }

    if (lifecycle != null && typeof lifecycle !== 'string') {
      throw new Error('Lifecycle must be a string.');
    }

    this._map.set(T, {
      factory: factory,
      id: uid(),
      lifecycle: Lifecycle.parse(lifecycle || Lifecycle.DEFAULT),
      pending: false
    });

    return this;
  },

  /**
   * Returns an instance bound to T. If the strict boolean is set, the return instance
   * must be a non null or undefined value.
   *
   * @throws {Error} If dependency could not be resolved.
   * @throws {Error} If a circular dependency is detected.
   * @throws {Error} If an unsupported lifecycle is defined.
   * @throws {Error} If strict is set, but the return instance did not reutrn a valid instance.
   *
   * @param  {T} T
   * @param  {Boolean=} strict
   * @return {U}
   */
  instance: function (T, strict) {
    var descriptor = this._map.get(T),
        instance = null;

    if (descriptor == null) {
      throw new Error('Dependency ' + formatTypeString(T) + ' could not be resolved because it has not been registered.');
    }

    if (descriptor.pending === true) {
      throw new Error('Circular dependency detected while resolving ' + formatTypeString(T, descriptor.id) + '.');
    }

    descriptor.pending = true;

    try {
      switch (descriptor.lifecycle) {
        case Lifecycle.SINGLETON:
          instance = this._singleton(descriptor);
          break;
        case Lifecycle.TRANSIENT:
          instance = this._transient(descriptor);
          break;
        default:
          throw new Error('Unsupported lifecycle ' + descriptor.lifecycle + '.');
      }
    } finally {
      descriptor.pending = false;
    }

    if (instance == null && strict) {
      throw new Error(formatTypeString(T, descriptor.id) + ' did not return a value.');
    }

    return instance;
  },

  /**
   * Returns a singleton instance.
   *
   * @param  {Object} descriptor
   * @return {T}
   */
  _singleton: function (descriptor) {
    if (this._cache[descriptor.id] == null) {
      this._cache[descriptor.id] = this._transient(descriptor);
    }

    return this._cache[descriptor.id];
  },

  /**
   * Returns a new instance.
   *
   * @param  {Object} descriptor
   * @return {T}
   */
  _transient: function (descriptor) {
    return descriptor.factory(this);
  }
};

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

      if (this[name] == name) {
        return name;
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
}(this));
