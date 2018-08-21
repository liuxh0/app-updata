/**
 * Any custom errors should extend this class. The custom error class should call
 * `extendError()` in constructor.
 *
 * @example
 *
 * class MyError extends CustomError {
 *   constructor(message?: string) {
 *     super(message);
 *     this.extendError(MyError);
 *   }
 * }
 *
 * @internal
 */
export abstract class CustomError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
    this.extendError(CustomError);
  }

  protected extendError(errorClass: any): void {
    Object.setPrototypeOf(this, errorClass.prototype);

    // Rewrite stack
    if (this.stack) {
      const lines = this.stack.split('\n');
      lines[0] = errorClass.name;
      lines.splice(1, 1);
      this.stack = lines.join('\n');
    }
  }
}
