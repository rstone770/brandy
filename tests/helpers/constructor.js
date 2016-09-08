export class TestClass {}

export const createTestClass = (onConstruction) => {
  return class TestClass {
    constructor (...args) {
      onConstruction(...args);
    }
  };
};
