var expect = require('chai').expect,
    Brandy = require('../bin/brandy'),
    noop = function () {};

describe('Brandy API', function () {
  it('should be a function.', function () {
    expect(Brandy).to.be.a.funciton;
  });

  it('should create a new container when called.', function () {
    expect(Brandy()).to.be.a.container;
    expect(Brandy()).to.not.equal(Brandy());
  });

  it('should create a new container when called with the "new" operator.', function () {
    expect(Brandy()).to.be.a.container;
    expect(new Brandy()).to.not.equal(new Brandy());
  });

  it('should expose a container instance.', function () {
    expect(Brandy.container).to.be.a.container;
  });

  it('should expose a version string.', function () {
    expect(Brandy.version).to.be.a.string;
  });

  describe('Brandy#toString', function () {
    it('should return a container identification string.', function () {
      expect(Brandy().toString()).to.equal('[object Container]');
    });
  });
});
