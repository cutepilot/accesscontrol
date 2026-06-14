/**
 * Error class specific to `AccessControl`.
 */
export class AccessControlError extends Error {
    message;
    name = 'AccessControlError';
    constructor(message = '') {
        super(message) /* istanbul ignore next */;
        this.message = message;
        // https://github.com/gotwarlost/istanbul/issues/690
        // http://stackoverflow.com/a/41429145/112731
        Object.setPrototypeOf(this, AccessControlError.prototype);
    }
}
//# sourceMappingURL=AccessControlError.js.map