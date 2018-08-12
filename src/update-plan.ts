export class UpdatePlan {
  /**
   * @internal
   */
  static construct(fromVersion: string): UpdatePlan {
    return new UpdatePlan(fromVersion);
  }

  private fromVersion: string;
  private nextVersions: Array<[string, () => any]>;

  private constructor(fromVersion: string) {
    this.fromVersion = fromVersion;
    this.nextVersions = new Array();
  }

  /**
   * @internal
   */
  addNextVersion(version: string, updateFunction: () => any): void {
    if (version === this.fromVersion) {
      throw new Error('Cannot add from-version.');
    } else if (this.nextVersions.some(value => value[0] === version)) {
      throw new Error('Version is already added.');
    }

    this.nextVersions.push([version, updateFunction]);
  }

  /**
   * Returns versions in the update path. The first element is the version that
   * is updated from, the last element is the version that is updated to.
   */
  getUpdatePath(): string[] {
    const nextVersions = this.nextVersions.map(value => value[0]);
    return [this.fromVersion, ...nextVersions];
  }

  /**
   * Executes update functions.
   * @rejects {any} Anything that update function throws or rejects
   */
  async execute(): Promise<void> {
    for (const value of this.nextVersions) {
      const updateFunction = value[1];
      await updateFunction();
    }
  }
}
