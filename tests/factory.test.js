var expect = require('chai').expect,
    Brandy = require('../bin/brandy');

describe('Brandy#factory', function () {
  var brandy = new Brandy();

  beforeEach(function () {
    brandy = new Brandy();
  });

  it('should throw a TypeError exception on an invalid factory type.', function () {
    var throwMe = function () {
      brandy.factory('type', 'invalid factory');
    };

    expect(throwMe).to.throw(TypeError);
  });

  it ('should throw a TypeError exception on an invalid lifecycle type.', function () {
    var throwMe = function () {
      brandy.factory('type', function () {}, {});
    };

    expect(throwMe).to.throw(TypeError);
  });

  it ('should throw a Error exception on invalid lifecycle value.', function () {
    var throwMe = function () {
      brandy.factory('type', function () {}, 'invalid lifecycle');
    };

    expect(throwMe).to.throw(Error);
  });

  it ('should register a well formed factory with no errors.', function () {
    brandy.factory({}, function () {});
    brandy.factory('type', function () {}, 'default');
    brandy.factory(['array'], function () {}, 'Transient');
    brandy.factory(123, function () {}, 'SINGLETON');
    brandy.factory(null, function () {}, 'SINGLETON');
  });

  it ('should be chainable.', function () {
    var actual = brandy.factory('type', function () {});

    expect(actual).to.equal(brandy);
  });
});
