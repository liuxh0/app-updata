import { expect } from 'chai';
import sinon from 'sinon';
import { UpdatePlan } from './update-plan';

const noop = () => { };

describe('UpdatePlan', () => {
  describe('construct()', () => {
    it('should return a new instance', () => {
      const updatePlan = UpdatePlan.construct('');
      expect(updatePlan).to.be.an.instanceof(UpdatePlan);
    });
  });

  describe('addNextVersion()', () => {
    it('should throw error if called with from-version or version already added', () => {
      const updatePlan = UpdatePlan.construct('0');
      updatePlan.addNextVersion('1', noop);

      expect(() => {
        updatePlan.addNextVersion('0', noop);
      }).to.throw();
      expect(() => {
        updatePlan.addNextVersion('1', noop);
      }).to.throw();
      expect(() => {
        updatePlan.addNextVersion('2', noop);
      }).to.not.throw();
    });
  });

  describe('getUpdatePath()', () => {
    it('should return array if no versions added', () => {
      const updatePlan = UpdatePlan.construct('0');
      expect(updatePlan.getUpdatePath()).to.eql(['0']);
    });

    it('should return array including from-version and added versions in order', () => {
      const fromVersion = '0';
      const versions = ['1', '3', '2', '4'];

      const updatePlan = UpdatePlan.construct(fromVersion);
      versions.forEach(version => updatePlan.addNextVersion(version, noop));

      const updatePath = updatePlan.getUpdatePath();
      expect(updatePath).to.eql([fromVersion, ...versions]);
    });
  });

  describe('execute()', () => {
    it('should call update functions in order and await', async () => {
      const versions: string[] = ['1', '2'];
      const expectedCalls: sinon.SinonSpy[] = [];

      const updatePlan = UpdatePlan.construct('');
      versions.forEach(version => {
        const resolveSpy = sinon.fake((resolve: () => any) => resolve());
        const updateFunctionSpy = sinon.fake(() => {
          return new Promise(resolve => {
            setImmediate(() => resolveSpy(resolve));
          });
        });

        updatePlan.addNextVersion(version, updateFunctionSpy);
        expectedCalls.push(updateFunctionSpy, resolveSpy);
      });

      await updatePlan.execute();
      sinon.assert.callOrder(...expectedCalls);
    });
  });
});
