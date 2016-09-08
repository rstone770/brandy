import { expect } from 'chai';
import { isContainer, createContainer } from '../src';

describe('isContainer', () => {
  it('can determine if a value is not a container type', () => {
    expect(isContainer()).to.equal(false);
    expect(isContainer(null)).to.equal(false);
    expect(isContainer(666)).to.equal(false);
    expect(isContainer('fabio')).to.equal(false);
    expect(isContainer({})).to.equal(false);
  });

  it('can determin if a value is a container type', () => {
    expect(
      isContainer(createContainer())
    ).to.equal(true);
  });
});
