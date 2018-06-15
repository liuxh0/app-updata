export class VersionUpdater {
  /**
   * The version that is updated to.
   */
  readonly targetVersion: string;

  private updateOperations: Map<string, () => any>;

  /**
   * @param version The version that is updated to.
   */
  constructor(version: string) {
    this.targetVersion = version;
    this.updateOperations = new Map();
  }

  /**
   * Adds an update operation from a version to the target version.
   * @param version Version that is updated from.
   * @param updateOperation Operation to update from the version to the target version.
   * @throws {Error} if the version is not valid.
   */
  registerUpdateOperationFromVersion(version: string, updateOperation: () => any): void {
    if (this.updateOperations.has(version)) {
      throw new Error(`Update operation from version ${version} to the target version already exists.`);
    }

    this.updateOperations.set(version, updateOperation);
  }

  /**
   * Returns all version that can be updated from.
   */
  getUpdatableVersions(): string[] {
    return Array.from(this.updateOperations.keys());
  }

  /**
   * Returns if the update operation is registered.
   * @param version Version that is updated from.
   */
  updatableFromVersion(version: string): boolean {
    return this.updateOperations.has(version);
  }

  /**
   * Performs an update.
   * @param version Version that is updated from.
   * @throws {Error} if the version is not registered before.
   */
  performUpdateOperationFromVersion(version: string): Promise<void> {
    const operation = this.updateOperations.get(version);
    if (operation === undefined) {
      throw new Error(`Update operation from version ${version} to the target version does not exist.`);
    }

    return new Promise(async resolve => {
      await operation();
      resolve();
    });
  }
}
