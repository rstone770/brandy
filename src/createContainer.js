/**
 * Creates an object from its constructor.
 *
 * @param {function} ctor
 * @param {*[]} args
 * @returns {object}
 */
const createFromConstructor = (ctor, args) => new (Function.bind.apply(ctor, [null, ...args]));

/**
 * Creates a normalized descriptor object that describes object creation for a specific activator.
 *
 * @typedef {{
 *    activator: function,
 *    dependencies: string[],
 *    options: object,
 *    pending: boolean,
 * }} Descriptor
 *
 * @param {function} activator
 * @param {string[]} dependencies
 * @param {object} options
 * @returns {Descriptor}
 */
const createDescriptor = (activator, dependencies = [], options = {}) => {
  return {
    activator,
    dependencies,
    options,
    pending: false
  };
};

/**
 * String representation of container types.
 *
 * @type {string}
 */
export const CONTAINER_TYPE = '[object Container]';

/**
 * Creates a new container object applying an enhancer provided.
 *
 * @typedef {{
 *    bind: function(string, function, object=),
 *    factory: function(string, function, object=),
 *    instance: function(string),
 *    toString: function
 * }} Container
 *
 * @param {function=} enhancer
 * @returns {Container}
 */
export default function createContainer (enhancer) {
  if (enhancer != null) {
    if (typeof enhancer !== 'function') {
      throw new TypeError('enhancer must be a function.');
    }

    return enhancer(createContainer)();
  }

  /**
   * Registered activator descriptors.
   *
   * @type {object.<string, Descriptor>}
   */
  const descriptors = Object.create(null);

  /**
   * Creates a new object from a factory and a list of its dependencies.
   *
   * @param {function} factory
   * @param {string[]} dependencies
   * @returns {*}
   */
  const activate = (factory, dependencies) => factory(...dependencies.map((name) => instance(name)));

  /**
   * Binds a constructor to a specific name.
   *
   * @param {string} name
   * @param {function} constructor
   * @param {object=} options
   * @returns {Container}
   */
  const bind = (name, constructor, options = {}) => {
    if (typeof name !== 'string') {
      throw new TypeError('name must be a string.');
    }

    if (typeof constructor !== 'function') {
      throw new TypeError('constructor must be a function.');
    }

    if (typeof options !== 'object') {
      throw new TypeError('options must be a none null object.');
    }

    return factory(
      name,
      (...dependencies) => createFromConstructor(constructor, dependencies),
      options
    );
  };

  /**
   * Registers a factory under a given name.
   *
   * @param {string} name
   * @param {function} factory
   * @param {object=} options
   * @returns {Container}
   */
  const factory = (name, factory, options) => {
    const descriptorOptions = options || {};

    if (typeof name !== 'string') {
      throw new TypeError('name must be a string.');
    }

    if (typeof factory !== 'function') {
      throw new TypeError('factory must be a function.');
    }

    if (typeof descriptorOptions !== 'object') {
      throw new TypeError('options must be an object.');
    }

    descriptors[name] = createDescriptor(
      factory,
      descriptorOptions.dependencies,
      descriptorOptions
    );

    return API;
  };

  /**
   * Returns an instance of a value registered under `name` resolving all dependencies it may have.
   *
   * @param {string} name
   * @returns {*}
   */
  const instance = (name) => {
    if (typeof name !== 'string') {
      throw new TypeError('name must be a string.');
    }

    const descriptor = descriptors[name];
    let value = null;

    if (descriptor == null) {
      throw new Error(`Dependency ${name} could not be resolved because it has not been registered.`);
    }

    if (descriptor.pending) {
      throw new Error(`Circular dependency detected while resolving ${name}.`);
    }

    descriptor.pending = true;

    try {
      value = activate(descriptor.activator, descriptor.dependencies);
    } finally {
      descriptor.pending = false;
    }

    return value;
  };

  /**
   * Returns the string representation of container.
   *
   * @returns {string}
   */
  const toString = () => `${CONTAINER_TYPE}`;

  /**
   * Public container api.
   *
   * @type {Container}
   */
  const API = {
    bind,
    factory,
    instance,
    toString
  };

  factory('@@container', () => API);

  return API;
}
