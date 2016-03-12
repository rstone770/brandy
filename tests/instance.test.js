var expect = require('chai').expect,
    Brandy = require('../bin/brandy');

describe('Brandy#instance', function () {
  var brandy = new Brandy();

  /**
   * Create a new brandy instance with things registered with a lifecycle.
   *
   * @param  {String} lifecycle
   * @return {Brandy}
   */
  var lifecycle = function (lifecycle) {
    var brandy = new Brandy();

    brandy.bind('instance', function () {}, { lifecycle: lifecycle });
    brandy.factory('factory', function () {
      return [];
    }, lifecycle);

    return brandy;
  };

  /**
   * Creates a wrapped function that will defer an instance call.
   *
   * @param  {Brandy} brandy
   * @param  {*} type
   * @param  {Boolean=} strict
   * @return {Function}
   */
  var throwOnInstanceFor = function (brandy, type, strict) {
    return function () {
      brandy.instance(type, strict);
    };
  };

  beforeEach(function () {
    brandy = new Brandy();
  });

  it('should materialize from a registered factory.', function () {
    brandy.factory('factory', function () {
      return 'value';
    });

    expect(brandy.instance('factory')).to.equal('value');
  });

  it('should inject brandy into factory.', function (done) {
    brandy.factory('factory', function (brandy) {
      expect(brandy).to.equal(brandy);
      done();
    }).instance('factory');
  });

  it('should materialize from a registered implementation.', function () {
    var Implementation = function () {};
    brandy.bind('instance', Implementation);

    expect(brandy.instance('instance')).to.be.instanceOf(Implementation);
  });

  it('should inject resolved dependencies into implementation constructor.', function () {
    var Foo = function (bar, baz) {
          this.bar = bar;
          this.baz = baz;
        },
        Bar = function () {},
        Baz = function (bar) {
          this.bar = bar;
        };

    brandy.bind(Foo, Foo, { dependencies: [Bar, Baz] });
    brandy.bind(Bar, Bar);
    brandy.bind(Baz, Baz, { dependencies: [Bar] });

    var actual = brandy.instance(Foo);

    expect(actual).to.be.instanceOf(Foo);
    expect(actual.bar).to.be.instanceOf(Bar);
    expect(actual.baz).to.be.instanceOf(Baz);
    expect(actual.baz.bar).to.be.instanceOf(Bar);
  });

  it('should create new objects with "transient" lifecycle.', function () {
    var brandy = lifecycle('transient');

    expect(brandy.instance('factory')).to.not.equal(brandy.instance('factory'));
    expect(brandy.instance('instance')).to.not.equal(brandy.instance('instance'));
  });

  it('should throw an Error exception on unresolved dependencies.', function () {
    brandy.bind('instance', function () {}, { dependencies: [null] });
    brandy.factory('factory', function ($b) {
      $b.instance(null);
    });

    expect(throwOnInstanceFor(brandy, 'factory')).to.throw(Error, 'could not be resolved');
    expect(throwOnInstanceFor(brandy, 'instance')).to.throw(Error, 'could not be resolved');
  });

  it('should return same objects with "singleton" lifecycle.', function () {
    var brandy = lifecycle('singleton');

    expect(brandy.instance('factory')).to.equal(brandy.instance('factory'));
    expect(brandy.instance('instance')).to.equal(brandy.instance('instance'));
  });

  it('should treat "default" lifecycles as singleton.', function () {
    var brandy = lifecycle('default');

    expect(brandy.instance('factory')).to.equal(brandy.instance('factory'));
    expect(brandy.instance('instance')).to.equal(brandy.instance('instance'));
  });

  it('should detect cycles.', function () {
    brandy.bind('instance', function () {}, { dependencies: ['instance'] });
    brandy.bind('nested', function () {}, { dependencies: ['deep'] });
    brandy.bind('deep', function () {}, { dependencies: ['nested'] });
    brandy.factory('factory', function ($) {
      $.instance('factory');
    });

    expect(throwOnInstanceFor(brandy, 'instance')).to.throw(Error, 'Circular');
    expect(throwOnInstanceFor(brandy, 'factory')).to.throw(Error, 'Circular');
    expect(throwOnInstanceFor(brandy, 'nested')).to.throw(Error, 'Circular');
  });

  it('should throw an error on strict mode when a null or undefined value is materialized.', function () {
    brandy.factory('factory', function () {
      return;
    });

    expect(throwOnInstanceFor(brandy, 'factory', true)).to.throw(Error, 'strict');
  });

  it('should resolve well formed dependencies.', function () {
    var Service = function (password, database, logger) {
          this.password = password;
          this.database = database;
          this.logger = logger;
        },
        Database = function (connection, logger) {
          this.connection = connection;
          this.logger = logger;
        };

    brandy.bind(Service, Service, { dependencies: ['password', Database, 'logger'] });
    brandy.bind(Database, Database, { dependencies: ['connection', 'logger'] });
    brandy.factory('connection', function ($) {
      return { logger: $.instance('logger') };
    });
    brandy.factory('password', function () {
      return 'password';
    });
    brandy.factory('logger', function () {
      return {};
    });

    var actual = brandy.instance(Service);

    expect(actual).to.be.instanceOf(Service);
    expect(actual.database).to.be.instanceOf(Database);
    expect(actual.password).to.equal('password');
    expect(actual.logger).to.be.an('object');
    expect(actual.database.logger).to.equal(actual.logger);
    expect(actual.database.connection).to.be.an('object');
    expect(actual.database.connection.logger).to.equal(actual.logger);
  });
});
