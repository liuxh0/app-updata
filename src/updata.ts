import { IConfiguredUpdatePlan, UpdatePlan } from './update-plan';
import { VersionUpdater } from './version-updater';

export interface IUpdataConfigurator {
  /**
   * Configures a next version.
   * @param version Identifier of the version.
   * @param updateFunction Operation to update from the previous version to this version.
   * @returns Interface for further configuration.
   * @throws {Error} if the version is not valid.
   */
  next(version: string, updateFunction?: () => any): IUpdataConfigurator;

  /**
   * Configures a shortcut update from a earlier version to this version.
   * @param version Identifier of a earlier version.
   * @param updateFunction Operation to update from the earlier version to this version.
   * @returns Interface for further configuration.
   * @throws {Error} if the version is not valid.
   */
  shortcutFrom(version: string, updateFunction: () => any): IUpdataConfigurator;

  /**
   * Marks configuration done.
   * @returns Interface for further usage.
   */
  done(): IConfiguredUpdata;
}

export interface IConfiguredUpdata {
  /**
   * Returns an update plan according to configuration.
   * @param from Version that is updated from.
   * @param to Version that is updated to.
   * @throws {Error} if no update can be made between two versions.
   */
  getUpdatePlan(from: string, to: string): IConfiguredUpdatePlan;
}

export class Updata implements IUpdataConfigurator, IConfiguredUpdata {
  /**
   * Creates an Updata instance.
   * @param version The first version that can be updated from.
   * @returns Interface for configuration.
   */
  static startWith(version: string): IUpdataConfigurator {
    return new Updata(version);
  }

  private versionUpdaters: Map<string, VersionUpdater>;
  private configurationDone: boolean;

  private constructor(firstVersion: string) {
    this.versionUpdaters = new Map([[firstVersion, new VersionUpdater(firstVersion)]]);
    this.configurationDone = false;
  }

  /** @implements {IUpdataConfigurator} */
  next(version: string, updateFunction?: () => any): IUpdataConfigurator {
    if (this.configurationDone) {
      throw new Error('Configuration is already done.');
    }

    if (this.versionUpdaters.has(version)) {
      throw new Error(`Version ${version} was already configured.`);
    }

    const previousVersion = this.getLastVersionUpdater().targetVersion;
    const nextVersionUpdater = new VersionUpdater(version);
    nextVersionUpdater.registerUpdateFunctionFromVersion(previousVersion, updateFunction || (() => undefined));
    this.versionUpdaters.set(version, nextVersionUpdater);

    return this;
  }

  /** @implements {IUpdataConfigurator} */
  shortcutFrom(version: string, updateFunction: () => any): IUpdataConfigurator {
    if (this.configurationDone) {
      throw new Error('Configuration is already done.');
    }

    if (this.versionUpdaters.has(version) === false) {
      throw new Error(`Version ${version} was not configured.`);
    }

    const versionUpdater = this.getLastVersionUpdater();
    versionUpdater.registerUpdateFunctionFromVersion(version, updateFunction);
    return this;
  }

  /** @implements {IUpdataConfigurator} */
  done(): IConfiguredUpdata {
    this.configurationDone = true;
    return this;
  }

  /** @implements {IConfiguredUpdata} */
  getUpdatePlan(from: string, to: string): IConfiguredUpdatePlan {
    if (this.versionUpdaters.has(from) === false) {
      throw new Error(`Version ${from} was not configured.`);
    }

    if (this.versionUpdaters.has(to) === false) {
      throw new Error(`Version ${to} was not configured.`);
    }

    const versions = Array.from(this.versionUpdaters.keys());
    if (versions.indexOf(from) >= versions.indexOf(to)) {
      throw new Error(`Target version is prior to origin version.`);
    }

    // Parameters are fine. Let's find a update plan now.
    const updateSteps: Array<{
      fromVersion: string,
      toVersion: string,
      updateFunction: () => any
    }> = new Array();

    while (true) {
      const targetVersion = updateSteps.length ? updateSteps[0].fromVersion : to;
      if (targetVersion === from) {
        break;
      }

      const versionUpdater = this.versionUpdaters.get(targetVersion)!;
      const allUpdatableVersions = versionUpdater.getUpdatableVersions();
      const validUpdatableVersions = allUpdatableVersions
        .filter(v => versions.indexOf(v) >= versions.indexOf(from))
        .sort((a, b) => versions.indexOf(a) - versions.indexOf(b));
      const earliestUpdatableVersion = validUpdatableVersions[0];

      updateSteps.unshift({
        fromVersion: earliestUpdatableVersion,
        toVersion: targetVersion,
        updateFunction: versionUpdater.getUpdateFunctionFromVersion(earliestUpdatableVersion)
      });
    }

    const updatePlanConfigurator = UpdatePlan.configure(from);
    updateSteps.forEach(step => {
      updatePlanConfigurator.addNextVersion(step.toVersion, step.updateFunction);
    });

    return updatePlanConfigurator.done();
  }

  private getLastVersionUpdater(): VersionUpdater {
    const keys = Array.from(this.versionUpdaters.keys());
    const lastKey = keys[keys.length - 1];
    return this.versionUpdaters.get(lastKey)!;
  }
}
