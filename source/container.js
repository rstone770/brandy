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
