import { expect } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { Updata } from './updata';
import { UpdatePlan } from './update-plan';

const noop = () => { };

describe('Updata', () => {
  describe('startWith()', () => {
    it('should return an instance of Updata', () => {
      const configurator = Updata.startWith('');
      expect(configurator).to.be.an.instanceof(Updata);
    });
  });

  describe('next()', () => {
    it('throw error if called with start version', () => {
      const startVersion = 'start';
      const configurator = Updata.startWith(startVersion);
      expect(() => {
        configurator.next(startVersion);
      }).to.throw(Error);
    });

    it('throw error if called with a version repeatedly', () => {
      const startVersion = 'start';
      const nextVersion = 'next';

      const configurator = Updata.startWith(startVersion).next(nextVersion);
      expect(() => {
        configurator.next(nextVersion);
      }).to.throw(Error);
    });

    it('throw error if called after done()', () => {
      const configurator = Updata.startWith('0');
      configurator.done();

      expect(() => {
        configurator.next('0');
      }).to.throw(Error);
    });

    it('should return the same instance', () => {
      const configurator = Updata.startWith('0');
      expect(configurator).to.equal(configurator.next('1'));
    });
  });

  describe('shortcutFrom', () => {
    it('should throw error if called with an unknown version', () => {
      const configurator = Updata.startWith('0');
      expect(() => {
        configurator.shortcutFrom('1', noop);
      }).to.throw(Error);
    });

    it('should throw error if called with current or previous version', () => {
      const configurator = Updata.startWith('0');
      expect(() => {
        configurator.shortcutFrom('0', noop);
      }).to.throw(Error);

      configurator.next('1');
      expect(() => {
        configurator.shortcutFrom('0', noop);
      }).to.throw(Error);
      expect(() => {
        configurator.shortcutFrom('1', noop);
      }).to.throw(Error);
    });

    it('should throw error if called with a version repeatedly', () => {
      const configurator = Updata.startWith('0').next('1').next('2');
      configurator.shortcutFrom('0', noop);
      expect(() => {
        configurator.shortcutFrom('0', noop);
      }).to.throw(Error);
    });

    it('should throw error if called after done()', () => {
      const configurator = Updata.startWith('0');
      configurator.done();

      expect(() => {
        configurator.shortcutFrom('0', noop);
      }).to.throw(Error);
    });

    it('should return the same instance', () => {
      const configurator = Updata.startWith('0').next('1').next('2');
      expect(configurator).to.equal(configurator.shortcutFrom('0', noop));
    });
  });

  describe('done()', () => {
    it('should return the same instance', () => {
      const configurator = Updata.startWith('0');
      const configured = configurator.done();
      expect(configurator).to.equal(configured);
    });
  });

  describe('getUpdatePlan()', () => {
    const sinonSandbox = sinon.createSandbox();

    afterEach(() => {
      sinonSandbox.restore();
    });

    it('should throw error if from-version or to-version is unknown', () => {
      const updata = Updata.startWith('0').next('1').done();

      expect(() => {  // unknown from-version
        updata.getUpdatePlan('-1', '1');
      }).to.throw(Error);

      expect(() => {  // unknown to-version
        updata.getUpdatePlan('0', '2');
      }).to.throw(Error);
    });

    it('should throw error if to-version if prior to from-version', () => {
      const updata = Updata.startWith('0').next('1').done();
      expect(() => {
        updata.getUpdatePlan('1', '0');
      }).to.throw(Error);
    });

    it('should create UpdatePlan correctly and return it', () => {
      const constructor = UpdatePlan.construct;
      const configureSpy = sinonSandbox.stub(UpdatePlan, 'construct').callsFake((...args) => {
        const returnValue = constructor.call(undefined, args);
        sinonSandbox.spy(returnValue, 'addNextVersion');
        return returnValue;
      });

      const updata = Updata.startWith('0')
        .next('1')
        .next('2', noop)
        .next('3')
        .shortcutFrom('0', noop)
        .shortcutFrom('1', noop)
        .next('4')
        .next('5')
        .done();

      updata.getUpdatePlan('0', '5');
      expect(configureSpy.calledOnceWith('0')).to.equal(true);

      const updatePlan = configureSpy.returnValues[0] as UpdatePlan;
      const addNextVersionSpy = updatePlan.addNextVersion as SinonSpy;
      expect(addNextVersionSpy.calledThrice).to.equal(true);
      expect(addNextVersionSpy.getCall(0).calledWith('3')).to.equal(true);
      expect(addNextVersionSpy.getCall(1).calledWith('4')).to.equal(true);
      expect(addNextVersionSpy.getCall(2).calledWith('5')).to.equal(true);
    });
  });
});
