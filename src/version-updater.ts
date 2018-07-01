export class VersionUpdater {
  /**
   * The version that is updated to.
   */
  readonly targetVersion: string;

  private updateFunctions: Map<string, () => any>;

  /**
   * @param version The version that is updated to.
   */
  constructor(version: string) {
    this.targetVersion = version;
    this.updateFunctions = new Map();
  }

  /**
   * Adds an update function.
   * @param version Version that is updated from.
   * @param updateFunction Operation to update from the version to the target version.
   * @throws {Error} if the version is not valid.
   */
  registerUpdateFunctionFromVersion(version: string, updateFunction: () => any): void {
    if (this.updateFunctions.has(version)) {
      throw new Error(`Update function from version ${version} to the target version was already registered.`);
    }

    this.updateFunctions.set(version, updateFunction);
  }

  /**
   * Returns all version that can be updated from.
   */
  getUpdatableVersions(): string[] {
    return Array.from(this.updateFunctions.keys());
  }

  /**
   * Returns if the update function is registered.
   * @param version Version that is updated from.
   */
  updatableFromVersion(version: string): boolean {
    return this.updateFunctions.has(version);
  }

  /**
   * Returns the update function.
   * @param version Version that is updated from.
   * @throws {Error} if the version is not registered before.
   */
  getUpdateFunctionFromVersion(version: string): () => any {
    const updateFunction = this.updateFunctions.get(version);
    if (updateFunction === undefined) {
      throw new Error(`Update function from version ${version} to the target version was not registered.`);
    }

    return updateFunction;
  }
}
