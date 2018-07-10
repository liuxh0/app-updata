import { expect } from 'chai';
import sinon from 'sinon';
import { UpdatePlan } from './update-plan';

const noop = () => { };

describe('UpdatePlan', () => {
  describe('configure()', () => {
    it('should return a new instance', () => {
      const configurator = UpdatePlan.configure('');
      expect(configurator).to.be.an.instanceof(UpdatePlan);
    });
  });

  describe('addNextVersion()', () => {
    it('should throw error if called with from-version or version already added', () => {
      const configurator = UpdatePlan.configure('0');
      configurator.addNextVersion('1', noop);

      expect(() => {
        configurator.addNextVersion('0', noop);
      }).to.throw();
      expect(() => {
        configurator.addNextVersion('1', noop);
      }).to.throw();
      expect(() => {
        configurator.addNextVersion('2', noop);
      }).to.not.throw();
    });

    it('should throw error if called after done()', () => {
      const configurator = UpdatePlan.configure('0');
      expect(() => {
        configurator.done();
        configurator.addNextVersion('1', noop);
      }).to.throw();
    });
  });

  describe('done()', () => {
    it('should return the same instance', () => {
      const configurator = UpdatePlan.configure('0');
      const configured = configurator.done();
      expect(configured).to.equal(configurator);
    });
  });

  describe('getUpdatePath()', () => {
    it('should return array if no versions added', () => {
      const configured = UpdatePlan.configure('0').done();
      expect(configured.getUpdatePath()).to.eql(['0']);
    });

    it('should return array including from-version and added versions in order', () => {
      const fromVersion = '0';
      const versions = ['1', '3', '2', '4'];

      const configurator = UpdatePlan.configure(fromVersion);
      versions.forEach(version => configurator.addNextVersion(version, noop));
      const configured = configurator.done();

      const updatePath = configured.getUpdatePath();
      expect(updatePath).to.eql([fromVersion, ...versions]);
    });
  });

  describe('execute()', () => {
    it('should call update functions in order and await', async () => {
      const versions: string[] = ['1', '2'];
      const expectedCalls: sinon.SinonSpy[] = [];

      const configurator = UpdatePlan.configure('');
      versions.forEach(version => {
        const resolveSpy = sinon.fake((resolve: () => any) => resolve());
        const updateFunctionSpy = sinon.fake(() => {
          return new Promise(resolve => {
            setImmediate(() => resolveSpy(resolve));
          });
        });

        configurator.addNextVersion(version, updateFunctionSpy);
        expectedCalls.push(updateFunctionSpy, resolveSpy);
      });

      const configured = configurator.done();
      await configured.execute();

      sinon.assert.callOrder(...expectedCalls);
    });
  });
});
