/**
 * Error class specific to `AccessControl`.
 */
export class AccessControlError extends Error {
  public override name: string = 'AccessControlError';
  constructor(public override message: string = '') {

    super(message)/* istanbul ignore next */;
    // https://github.com/gotwarlost/istanbul/issues/690

    // http://stackoverflow.com/a/41429145/112731
    Object.setPrototypeOf(this, AccessControlError.prototype);
  }
}
