/**
 * Error class specific to `AccessControl`.
 */
export declare class AccessControlError extends Error {
    message: string;
    name: string;
    constructor(message?: string);
}
