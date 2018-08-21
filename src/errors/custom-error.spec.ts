import { expect } from 'chai';
import { CustomError } from './custom-error';

describe('CustomError', () => {
  describe('constructor', () => {
    it('should construct an instance of Error and CustomError', () => {
      const error = new SomeError();
      expect(error).to.be.an.instanceof(Error);
      expect(error).to.be.an.instanceof(CustomError);
    });

    it('should construct with message', () => {
      const message = 'Error message';
      const error = new SomeError(message);
      expect(error.message).equal(message);
    });
  });

  describe('extendError()', () => {
    it('should set prototype', () => {
      const error1 = new SomeError();
      expect(error1).to.not.be.an.instanceof(SomeError);

      const error2 = new SomeExtendedError();
      expect(error2).to.be.an.instanceof(SomeExtendedError);
    });
  });
});

class SomeError extends CustomError {

}

class SomeExtendedError extends CustomError {
  constructor() {
    super();
    this.extendError(SomeExtendedError);
  }
}
