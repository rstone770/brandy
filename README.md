Brandy
======

A cute, smart, and expendable IOC container for javascript.

```
npm install @rstone770/brandy
```

Brandy at heart is a minimal yet powerful IOC container that aims for elegance while simultaneously being very accommodating. While the main API is only three methods, using container enhancer patterns heavily influenced by [redux](http://redux.js.org/) allows Brandy to be extended to meet any demand.

```js
import { createContainer } from 'brandy';

class Foo {
    constructor(bar, baz) {
      console.log(bar, baz);
    }
};

const barFactory = () => 'bar value';

const container = createContainer()
    .bind('foo', Foo, { dependencies: ['bar', 'baz'] })
    .factory('bar', barFactory)
    .factory('baz', (bar) => `${bar} baz!`, { dependencies: ['bar'] });
    
const foo = container.instance('foo');
```

## Influences

Although not a IOC solution, the elegance and architecture were heavily influenced by [redux](http://redux.js.org/)

## Installation

```bash
npm install --save @rston770/brandy
```

## API

### createContainer(enhancer = null)

Creates a new container instance running it through an enhancer if one is provided.

#### Usage with `enhancer`

Enhancers allow enhancement and extension of the container simply by calling the enhancer with itself so that the behavior and shape of the container can be controlled.

```js
const instanceLogger = (createContainer) => {
    return () => {
        const container = createContainer();
        
        const instance = (name) => {
            const next = container.name();
            console.log(`producing ${name}.`);
            
            return next(name);
        };
        
        return { ...container, instance };
    };
};

const loggedContainer = createContainer(instanceLogger);

loggedContainer
    .factory('dep', () => 'value')
    .instance('dep'); // console.log('producing dep')
```

Multiple enhancers can be used simply by composing the enhancers. Any library that allows for functional composition can be used.

```js
const logger = (createContainer) => () => { return createContainer() }, // enhancer that adds logging
      lifecycle = (createContainer) => () => { return createContainer() }; // enhancer that adds life cycle support
      
const enhancedContainer = createContainer((createContainer) => logger(lifecycle(createContainer)));
```

### isContainer(value)

Simply determines if a value is a container type.

```js
isContainer(createContainer()); // true
isContainer(12312); // false
isContainer({}); // false
```

## Container API

### bind(name, Constructor, options={})

`bind` will bind a constructor to a specific name. Using bind on constructors/classes is important because when the dependency activates, it properly invokes the `new` operator instead of simply calling constructor.

```js
class Test {};

const container = createContainer()
    .bind('correct', Test)
    .factory('incorrect', Test);
    
container.instance('correct') instanceof Test // true;
container.instance('incorrect') instanceof Test // false or exception;
```

#### With `options`

`bind` excepts an optional options object which allows for special configurations.

__options.dependencies: string[]__

Any dependencies listed will be injected in order to the constructor as arguments on instance creation.

## factory(name, factory(), options={})

`factory` will bind a factory to a specific name. Using factory is typically recommended since it allows for finer grained control of object creation.

```js
const container = createContainer()
    .factory('api', () => {
        return {/* some api */};
    });
    
const api = container.instance('api');
```

#### With `options`

`factory` excepts the same options that `bind` does and handles them exactly the same way. 

## instance(name)

`instance` will create a new instance of whatever is assigned to `name`. Dependency resolution will happen at this time only, so dependencies can be defined out of order. 
 
```js
const container = createContainer()
    .factory('service', (api) => {}, { dependencies: ['api'] }) 
    .factory('api', () => { /* some api */});
```
 
While resolving, any dependency that cannot be resolved or has a circular dependency will throw an exception and halt the activation process.

## License
 
MIT
