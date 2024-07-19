export interface IActionAttributes {
  [actionAndPossession: string]: string[];
}

// below is the proper interface but get errors with TS v5.5.2
// export type IGrantRoleInfo = { $extend?: string[]; }
//   & { [K in Exclude<string, '$extend'>]: IGrantResourceInfo; };

export interface IGrantsItem {
  /** k is either a resource name or `$extend` */
  [k: string]: IActionAttributes | string[];
}

/**
 * An interface that defines the grants object to be passed to AccessControl's
 * constructor. This object maps roles with their granted permissions.
 * @example
 * const grants: IGrantObject = {
 *   editor: {
 *    video: {
 *     'read:any': ['*'],
 *     'update:any': ['*', '!rating', '!views'],
 *   },
 *   admin: {
 *     $extend: ['editor'],
 *     video: {
 *       'create:any': ['*', '!views'],
 *       'delete:any': ['*']
 *     }
 *   },
 *   user: {
 *     video: {
 *       'create:own': ['*', '!rating', '!views'],
 *       'read:any': ['*'],
 *       'update:own': ['*', '!rating', '!views'],
 *       'delete:own': ['*']
 *     }
 *   }
 * }
 */
export interface IGrants {
  [role: string]: IGrantsItem;
}

/**
 * An interface that defines grants list item.
 * @see IAccessInfo
 */
export interface IGrantsListItem {
  /**
   *  Indicates the role for this access information.
   */
  role: string;
  /**
   *  Indicates thet resource for this access information.
   */
  resource: string;
  /**
   *  Defines the type of the operation (and the possession) that is (or not) to
   *  be performed on the resource(s) by the defined role(s).
   *  Note that this is not the same as `Action` enum. This is a string that
   *  includes both action and possession. e.g. `"read:any"`.
   */
  action: string;
  /**
   *  Defines the resource attributes which are granted. Either a
   *  comma-separated string or a string array.
   */
  attributes?: string | string[];
}

/** Grants list to be passed to AccessControl's constructor. */
export type IGrantsList = IGrantsListItem[];