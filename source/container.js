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
      throw new Error('Implementation must be a constructor.');
    }

    if (dependencies.constructor !== Array) {
      throw new Error('Dependencies must be an array.');
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
