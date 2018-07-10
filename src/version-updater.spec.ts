import { expect } from 'chai';
import { VersionUpdater } from './version-updater';

/* tslint:disable no-unused-expression */

const noop = () => { };

describe('VersionUpdater', () => {
  describe('constructor', () => {
    it('should set target version', () => {
      const targetVersion = 'targetVersion';
      const versionUpdater = new VersionUpdater(targetVersion);
      expect(versionUpdater.targetVersion).to.equal(targetVersion);
    });
  });

  describe('registerUpdateFunctionFromVersion()', () => {
    it('should throw error if called with the target version', () => {
      const targetVersion = 'targetVersion';
      const versionUpdater = new VersionUpdater(targetVersion);
      expect(() => {
        versionUpdater.registerUpdateFunctionFromVersion(targetVersion, noop);
      }).to.throw();
    });

    it('should throw error if called with a version twice', () => {
      const fromVersion = 'version';

      const versionUpdater = new VersionUpdater('');
      versionUpdater.registerUpdateFunctionFromVersion(fromVersion, noop);
      expect(() => {
        versionUpdater.registerUpdateFunctionFromVersion(fromVersion, noop);
      }).to.throw();
    });
  });

  describe('getUpdatableVersions()', () => {
    it('should return empty array if no version registered', () => {
      const versionUpdater = new VersionUpdater('');
      const updatableVersions = versionUpdater.getUpdatableVersions();
      expect(updatableVersions.length).to.equal(0);
    });

    it('should return registered versions in order', () => {
      const versions = ['a', 'c', 'b', 'd'];

      const versionUpdater = new VersionUpdater('');
      versions.forEach(version => {
        versionUpdater.registerUpdateFunctionFromVersion(version, noop);
      });

      const updatableVersions = versionUpdater.getUpdatableVersions();
      expect(updatableVersions).to.eql(versions);
    });
  });

  describe('updatableFromVersion()', () => {
    it('should return if version is registered', () => {
      const versionUpdater = new VersionUpdater('');
      versionUpdater.registerUpdateFunctionFromVersion('1', noop);
      expect(versionUpdater.updatableFromVersion('1')).to.be.true;
      expect(versionUpdater.updatableFromVersion('2')).to.be.false;
    });
  });

  describe('getUpdateFunctionFromVersion()', () => {
    it('should throw error if version is not registered', () => {
      const versionUpdater = new VersionUpdater('');
      expect(() => {
        versionUpdater.getUpdateFunctionFromVersion('version');
      }).to.throw();
    });

    it('should throw error if called with target version', () => {
      const targetVersion = 'targetVersion';
      const versionUpdater = new VersionUpdater(targetVersion);
      expect(() => {
        versionUpdater.getUpdateFunctionFromVersion(targetVersion);
      }).to.throw();
    });

    it('should return the same function as registered', () => {
      const functions: Array<[string, () => any]> = [
        ['v1', () => { /* function for v1 */ }],
        ['v2', () => { /* function for v2 */ }]
      ];

      const versionUpdater = new VersionUpdater('');
      for (const [version, updateFunction] of functions) {
        versionUpdater.registerUpdateFunctionFromVersion(version, updateFunction);
      }

      expect(versionUpdater.getUpdateFunctionFromVersion('v1')).to.equal(functions[0][1]);
      expect(versionUpdater.getUpdateFunctionFromVersion('v2')).to.equal(functions[1][1]);
    });
  });
});
