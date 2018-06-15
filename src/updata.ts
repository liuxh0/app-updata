import { UpdatePlan } from './update-plan';
import { VersionUpdater } from './version-updater';

type UpdateFunction = () => any;

interface INextVersionConfigurator {
  /**
   * Configures a next version.
   * @param version ID of the version.
   * @param operation Operation to update from the previous version to this version.
   * @returns Interface for further configuration.
   * @throws {Error} if the version is not valid.
   */
  next(version: string, operation?: UpdateFunction): IUpdataConfigurator;
}

interface IUpdataConfigurator extends INextVersionConfigurator {
  /**
   * Configures a shortcut update from a earlier version to this version.
   * @param version A earlier but not the previous version.
   * @param operation Operation to update from the earlier version to this version.
   * @returns Interface for further configuration.
   * @throws {Error} if the version is not valid.
   */
  shortcutFrom(version: string, operation: UpdateFunction): IUpdataConfigurator;

  /**
   * Marks configuration done.
   * @returns Interface for further usage.
   */
  done(): IConfiguredUpdata;
}

interface IConfiguredUpdata {
  getUpdatePlan(from: string, to: string): UpdatePlan;
}

export class Updata implements IUpdataConfigurator, IConfiguredUpdata {
  /**
   * Creates an Updata instance.
   * @param version The first version that can be updated from.
   * @returns Interface for configuration of a next version.
   */
  static startWith(version: string): INextVersionConfigurator {
    return new Updata(version);
  }

  private versionUpdaters: Map<string, VersionUpdater>;

  private constructor(firstVersion: string) {
    this.versionUpdaters = new Map([[firstVersion, new VersionUpdater(firstVersion)]]);
  }

  /** @implements {IUpdataConfigurator} */
  next(version: string, operation?: UpdateFunction): IUpdataConfigurator {
    if (this.versionUpdaters.has(version)) {
      throw new Error(`Version ${version} already exists`);
    }

    const previousVersion = this.getLastVersionUpdater().targetVersion;
    const nextVersionUpdater = new VersionUpdater(version);
    nextVersionUpdater.registerUpdateOperationFromVersion(previousVersion, operation || (() => {}));
    this.versionUpdaters.set(version, nextVersionUpdater);

    return this;
  }

  /** @implements {IUpdataConfigurator} */
  shortcutFrom(version: string, operation: UpdateFunction): IUpdataConfigurator {
    const versionUpdater = this.getLastVersionUpdater();
    versionUpdater.registerUpdateOperationFromVersion(version, operation);
    return this;
  }

  /** @implements {IUpdataConfigurator} */
  done(): IConfiguredUpdata {
    return this;
  }

  /** @implements {IConfiguredUpdata} */
  getUpdatePlan(from: string, to: string): UpdatePlan {
    // TODO
    return new UpdatePlan();
  }

  private getLastVersionUpdater(): VersionUpdater {
    const keys = Array.from(this.versionUpdaters.keys());
    const lastKey = keys[keys.length - 1];
    return this.versionUpdaters.get(lastKey)!;
  }
}
