import { expect } from 'chai';
import * as api from '../src';
import createContainer from '../src/createContainer';
import isContainer from '../src/isContainer';

describe('api', () => {
  it('exports createContainer', () => {
    expect(api).to.have.property('createContainer', createContainer);
  });

  it('exports isContainer', () => {
    expect(api).to.have.property('isContainer', isContainer);
  });
});
