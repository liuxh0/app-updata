import { UpdatePlan } from './update-plan';

const noop = () => { };

describe('UpdatePlan', () => {
  describe('configure()', () => {
    it('should return a new instance', () => {
      const configurator = UpdatePlan.configure('');
      expect(configurator instanceof UpdatePlan).toBeTruthy();
    });
  });

  describe('addNextVersion()', () => {
    it('should throw error if called with from-version or version already added', () => {
      const configurator = UpdatePlan.configure('0');
      configurator.addNextVersion('1', noop);

      expect(() => {
        configurator.addNextVersion('0', noop);
      }).toThrowError();
      expect(() => {
        configurator.addNextVersion('1', noop);
      }).toThrowError();
      expect(() => {
        configurator.addNextVersion('2', noop);
      }).not.toThrowError();
    });

    it('should throw error if called after done()', () => {
      const configurator = UpdatePlan.configure('0');
      expect(() => {
        configurator.done();
        configurator.addNextVersion('1', noop);
      }).toThrowError();
    });
  });

  describe('done()', () => {
    it('should return the same instance', () => {
      const configurator = UpdatePlan.configure('0');
      const configured = configurator.done();
      expect(configured).toBe(configurator as any);
    });
  });

  describe('getUpdatePath()', () => {
    it('should return array if no versions added', () => {
      const configured = UpdatePlan.configure('0').done();
      expect(configured.getUpdatePath()).toEqual(['0']);
    });

    it('should return array including from-version and added versions in order', () => {
      const fromVersion = '0';
      const versions = ['1', '3', '2', '4'];

      const configurator = UpdatePlan.configure(fromVersion);
      versions.forEach(version => configurator.addNextVersion(version, noop));
      const configured = configurator.done();

      const updatePath = configured.getUpdatePath();
      expect(updatePath).toEqual([fromVersion, ...versions]);
    });
  });

  describe('execute()', () => {
    it('should call update functions in order and await', async () => {
      const versions: Array<[string, () => any]> = [
        ['1', jasmine.createSpy()],
        ['2', jasmine.createSpy()]
      ];
      const functionCalls: string[] = [];

      const configurator = UpdatePlan.configure('');
      for (const [version, updateFunction] of versions) {
        configurator.addNextVersion(version, updateFunction);
        (updateFunction as jasmine.Spy).and.returnValue(new Promise(resolve => {
          setImmediate(() => {
            functionCalls.push(version);
            resolve();
          });
        }));
      }

      const configured = configurator.done();
      await configured.execute();

      expect(functionCalls).toEqual(versions.map(([version]) => version));
    });
  });
});
