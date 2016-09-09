import { expect, spy } from 'chai';
import createContainer, { CONTAINER_TYPE } from '../src/createContainer';
import { createTestClass, TestClass } from './helpers/constructor';

describe('createContainer', () => {
  it('exposes the public API', () => {
    const container = createContainer(),
          methods = Object.keys(container);

    expect(methods).to.have.length(4);
    expect(container.bind).to.be.a('function');
    expect(container.factory).to.be.a('function');
    expect(container.instance).to.be.a('function');
    expect(container.toString).to.be.a('function');
  });

  it('explodes when a non function enhancer is passed in', () => {
    expect(
      () => createContainer({})
    ).to.throw();

    expect(
      () => createContainer('fabio')
    ).to.throw();

    expect(
      () => createContainer(666)
    ).to.throw();
  });

  it('expects a null, undefined, or function enhancer', () => {
    expect(
      () => createContainer()
    ).to.not.throw();

    expect(
      () => createContainer(null)
    ).to.not.throw();

    expect(
      () => createContainer(() => () => {})
    ).to.not.throw();
  });

  it('passes in createContainer to enhancer', () => {
    const enhancer = spy(() => () => {});

    createContainer(enhancer);
    expect(enhancer).to.be.called.exactly(1);
    expect(enhancer).to.be.called.with.exactly(createContainer);
  });

  it('returns the results of the enhancer', () => {
    const newAPI = {};

    expect(
      createContainer(() => () => newAPI)
    ).to.equal(newAPI);
  });

  describe('bind', () => {
    it('throws if name is not a string', () => {
      expect(
        () => createContainer().bind(666, TestClass)
      ).to.throw();

      expect(
        () => createContainer().bind(null, TestClass)
      ).to.throw();

      expect(
        () => createContainer().bind({}, TestClass)
      ).to.throw();

      expect(
        () => createContainer().bind(() => {}, TestClass)
      ).to.throw();

      expect(
        () => createContainer().bind('fabio', TestClass)
      ).to.not.throw();
    });

    it('throws if constructor is not a function', () => {
      expect(
        () => createContainer().bind('fabio')
      ).to.throw();

      expect(
        () => createContainer().bind('fabio', 666)
      ).to.throw();

      expect(
        () => createContainer().bind('fabio', 'fabio')
      ).to.throw();

      expect(
        () => createContainer().bind('fabio', TestClass)
      ).to.not.throw();
    });

    it('throws if options is not nully or an object', () => {
      expect(
        () => createContainer().bind('fabio', TestClass, 'fabio')
      ).to.throw();

      expect(
        () => createContainer().bind('fabio', TestClass, 666)
      ).to.throw();

      expect(
        () => createContainer().bind('fabio', TestClass, () => {})
      ).to.throw();

      expect(
        () => createContainer().bind('fabio', TestClass)
      ).to.not.throw();

      expect(
        () => createContainer().bind('fabio', TestClass, null)
      ).to.not.throw();

      expect(
        () => createContainer().bind('fabio', TestClass, {})
      ).to.not.throw();
    });

    it('returns self', () => {
      const container = createContainer();

      expect(
        container.bind('fabio', TestClass)
      ).to.equal(container);
    });

    it('allows instance to invoke constructor', () => {
      const container = createContainer().bind('fabio', TestClass);

      expect(
        container.instance('fabio')
      ).to.be.instanceOf(TestClass);
    });

    it('invokes the constructor on each instance call', () => {
      const container = createContainer().bind('fabio', TestClass),
            first = container.instance('fabio'),
            second = container.instance('fabio');

      expect(first).to.not.equal(second);
    });
  });

  describe('factory', () => {
    it('throws if name is not a string', () => {
      expect(
        () => createContainer().factory(666, () => {})
      ).to.throw();

      expect(
        () => createContainer().factory(null, () => {})
      ).to.throw();

      expect(
        () => createContainer().factory({}, () => {})
      ).to.throw();

      expect(
        () => createContainer().factory(() => {}, () => {})
      ).to.throw();

      expect(
        () => createContainer().factory('fabio', () => {})
      ).to.not.throw();
    });

    it('throws if factory is not a function', () => {
      expect(
        () => createContainer().factory('fabio')
      ).to.throw();

      expect(
        () => createContainer().factory('fabio', 666)
      ).to.throw();

      expect(
        () => createContainer().factory('fabio', 'fabio')
      ).to.throw();

      expect(
        () => createContainer().factory('fabio', () => {})
      ).to.not.throw();
    });

    it('throws if options is not nully or an object', () => {
      expect(
        () => createContainer().factory('fabio', () => {}, 'fabio')
      ).to.throw();

      expect(
        () => createContainer().factory('fabio', () => {}, 666)
      ).to.throw();

      expect(
        () => createContainer().factory('fabio', () => {}, () => {})
      ).to.throw();

      expect(
        () => createContainer().factory('fabio', () => {})
      ).to.not.throw();

      expect(
        () => createContainer().factory('fabio', () => {}, null)
      ).to.not.throw();

      expect(
        () => createContainer().factory('fabio', () => {}, {})
      ).to.not.throw();
    });

    it('invokes the factory on instance', () => {
      const container = createContainer().factory('fabio', () => 'value');

      expect(
        container.instance('fabio')
      ).to.equal('value');
    });

    it('invokes each time instance is called', () => {
      const factory = spy(() => []),
            container = createContainer().factory('fabio', factory);

      container.instance('fabio');
      container.instance('fabio');

      expect(factory).to.be.called.exactly(2);
    });
  });

  describe('instance', () => {
    it('throws if name is not a string', () => {
      const container = createContainer().factory('fabio', () => {});

      expect(
        () => container.instance(null)
      ).to.throw();

      expect(
        () => container.instance()
      ).to.throw();

      expect(
        () => container.instance(666)
      ).to.throw();

      expect(
        () => container.instance({})
      ).to.throw();

      expect(
        () => container.instance('fabio')
      ).to.not.throw();
    });

    it('throws if name is not registered', () => {
      const container = createContainer();

      expect(
        () => container.intance('fabio')
      ).to.throw();
    });

    it('passes options.dependencies integration test', () => {
      const onConstruction = spy(),
            bFactory = spy(() => 'b'),
            cFactory = spy(() => 'c'),
            container = createContainer()
              .bind('a', createTestClass(onConstruction), { dependencies: ['b', 'c'] })
              .factory('b', bFactory, { dependencies: ['c'] })
              .factory('c', cFactory);

      container.instance('a');
      expect(onConstruction).to.be.called.with.exactly('b', 'c');
      expect(bFactory).to.be.called.with.exactly('c');
    });

    it('passes circular dependency integration test', () => {
      const container = createContainer()
        .bind('a', TestClass, { dependencies: ['c'] })
        .factory('b', () => {}, { dependencies: ['c'] })
        .factory('c', () => {}, { dependencies: ['a', 'b'] });

      expect(
        () => container.instance('a')
      ).to.throw();

      expect(
        () => container.instance('b')
      ).to.throw();
    });
  });

  describe('toString', () => {
    it('returns a special string', () => {
      expect(
        createContainer().toString()
      ).to.equal(CONTAINER_TYPE);
    });
  });
});
