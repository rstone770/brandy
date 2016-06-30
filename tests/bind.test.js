var expect = require('chai').expect,
    Brandy = require('../bin/brandy');

describe('Brandy#bind', function () {
  var brandy = new Brandy(),
      Implementation = function () {};

  beforeEach(function () {
    brandy = new Brandy();
  });

  it('should throw a TypeError exception on an invalid implementation type.', function () {
    var throwMe = function () {
      brandy.bind('type', 123);
    };

    expect(throwMe).to.throw(TypeError);
  });

  it('should throw a TypeError exception on an invalid dependencies type.', function () {
    var throwMe = function () {
      brandy.bind('type', Implementation, { dependencies: 'invalid type' });
    };

    expect(throwMe).to.throw(TypeError);
  });

  it('should throw a TypeError exception on an invalid Lifecycle type.', function () {
    var throwMe = function () {
      brandy.bind('type', Implementation, { lifecycle: [] });
    };

    expect(throwMe).to.throw(TypeError);
  });

  it('should throw a Error exception on invalid lifecycle value.', function () {
    var throwMe = function () {
      brandy.bind('type', Implementation, { lifecycle: 'invalid' });
    };

    expect(throwMe).to.throw(Error);
  });

  it('should register a well formed implementation with no errors.', function () {
    brandy.bind('type', Implementation);
    brandy.bind(null, Implementation, { dependencies: [] });
    brandy.bind(123, Implementation, { lifecycle: 'default', dependencies: [] });
    brandy.bind({ key: 'value' }, Implementation, { lifecycle: 'singleton' });
  });

  it('should be chainable.', function () {
    var actual = brandy.bind('type', Implementation);

    expect(actual).to.equal(brandy);
  });

  it('should increment length.', function () {
    brandy.bind('a', function () {});
    brandy.bind('b', function () {});
    brandy.bind('c', function () {});

    expect(brandy.length).to.equal(3);
  });

  it('should be included keys.', function () {
    brandy.bind('a', function () {});
    brandy.bind('b', function () {});
    brandy.bind('c', function () {});

    expect(brandy.keys).to.eql(['a', 'b', 'c']);
  });
});
