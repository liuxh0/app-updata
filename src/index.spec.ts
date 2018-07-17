import { expect } from 'chai';
import * as index from './index';

describe('index', () => {
  it('should export Updata and nothing else', () => {
    expect(Object.keys(index)).to.be.an('array').that.has.lengthOf(1).and.contains('Updata');
  });
});
