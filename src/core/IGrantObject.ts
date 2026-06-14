/**
 * An interface that defines grant object to pass AccessControl's constructor
 * @example
 * const grantObject: IGrantObject = {
 *     admin: {
 *         video: {
 *             'create:any': ['*', '!views'],
 *             'read:any': ['*'],
 *             'update:any': ['*', '!views'],
 *             'delete:any': ['*']
 *         }
 *     },
 *     user: {
 *         video: {
 *             'create:own': ['*', '!rating', '!views'],
 *             'read:own': ['*'],
 *             'update:own': ['*', '!rating', '!views'],
 *             'delete:own': ['*']
 *         }
 *     }
 * }
 */
export interface IGrantObject {
    [role: string]: {
        [resource: string]: {
            [actionAndPossesion: string]: string[];
        }
    }
}
