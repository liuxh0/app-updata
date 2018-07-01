export interface IUpdatePlanConfigurator {
  addNextVersion(version: string, updateFunction: () => any): void;
  done(): IConfiguredUpdatePlan;
}

export interface IConfiguredUpdatePlan {
  /**
   * Returns versions in the update path. The first element is the version that
   * is updated from, the last element is the version that is updated to.
   */
  getUpdatePath(): string[];

  /**
   * Executes update functions.
   */
  execute(): Promise<void>;
}

export class UpdatePlan implements IUpdatePlanConfigurator, IConfiguredUpdatePlan {
  static configure(fromVersion: string): IUpdatePlanConfigurator {
    return new UpdatePlan(fromVersion);
  }

  private fromVersion: string;
  private nextVersions: Array<[string, () => any]>;

  private constructor(fromVersion: string) {
    this.fromVersion = fromVersion;
    this.nextVersions = new Array();
  }

  /** @implements {IUpdatePlanConfigurator} */
  addNextVersion(version: string, updateFunction: () => any): void {
    if (this.nextVersions.some(value => value[0] === version)) {
      throw new Error('Version is already added.');
    }

    this.nextVersions.push([version, updateFunction]);
  }

  /** @implements {IUpdatePlanConfigurator} */
  done(): IConfiguredUpdatePlan {
    return this;
  }

  /** @implements {IConfiguredUpdatePlan} */
  getUpdatePath(): string[] {
    const nextVersions = this.nextVersions.map(value => value[0]);
    return [this.fromVersion, ...nextVersions];
  }

  /** @implements {IConfiguredUpdatePlan} */
  async execute(): Promise<void> {
    for (const value of this.nextVersions) {
      const updateFunction = value[1];
      await updateFunction();
    }
  }
}
