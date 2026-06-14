import { AccessControl } from './index.js';
import { IAccessInfo, IActionAttributes, IGrants, IGrantsItem, IGrantsListItem, IQueryInfo, UnknownObject } from './core/index.js';
/**
 * List of reserved keywords.
 * i.e. Roles, resources with these names are not allowed.
 */
export declare const RESERVED_KEYWORDS: string[];
/**
 * Error message to be thrown after AccessControl instance is locked.
 */
export declare const ERR_LOCK = "Cannot alter the underlying grants model. AccessControl instance is locked.";
export declare const utils: {
    /**
     * Gets the type of the given object.
     * @param o
     */
    type(o: unknown): string;
    /**
     * Specifies whether the given value is set (other that `null` or
     * `undefined`).
     * @param o - Value to be checked.
     */
    /**
     * Specifies whether the property/key is defined on the given object.
     * @param o
     * @param propName
     */
    hasDefined(o: UnknownObject, propName: string): boolean;
    /**
     * Converts the given (string) value into an array of string. Note that
     * this does not throw if the value is not a string or array. It will
     * silently return `[]` (empty array). So where ever it's used, the host
     * function should consider throwing.
     * @param value
     */
    toStringArray(value: unknown): string[];
    /**
     * Checks whether the given array consists of non-empty string items.
     * (Array can be empty but no item should be an empty string.)
     * @param arr - Array to be checked.
     */
    isFilledStringArray(arr: unknown[]): boolean;
    /**
     * Checks whether the given value is an empty array.
     * @param value - Value to be checked.
     */
    isEmptyArray(value: unknown): boolean;
    /**
     * Ensures that the pushed item is unique in the target array.
     * @param arr - Target array.
     * @param item - Item to be pushed to array.
     */
    pushUniq(arr: string[], item: string): string[];
    /**
     * Concats the given two arrays and ensures all items are unique.
     * @param arrA
     * @param arrB
     */
    uniqConcat(arrA: string[], arrB: string[]): string[];
    /**
     * Subtracts the second array from the first.
     * @param arrA
     * @param arrB
     */
    subtractArray(arrA: string[], arrB: string[]): string[];
    /**
     * Deep freezes the given object.
     * @param o - Object to be frozen.
     */
    deepFreeze(o: UnknownObject): UnknownObject | undefined;
    /**
     * Similar to JS .forEach, except this allows for breaking out early,
     * (before all iterations are executed) by returning `false`.
     * @param array
     * @param callback
     * @param thisArg
     */
    each(array: unknown[], callback: any, thisArg?: unknown | null): void;
    /**
     * Iterates through the keys of the given object. Breaking out early is
     * possible by returning `false`.
     * @param object
     * @param callback
     * @param thisArg
     */
    eachKey(object: UnknownObject, callback: any, thisArg?: unknown | null): void;
    eachRole(grants: IGrants, callback: (_role: IGrantsItem, roleName: string) => void): void;
    /**
     *
     */
    eachRoleResource(grants: IGrants, callback: (role: string, resource: string, resourceInfo: IActionAttributes) => void): void;
    /**
     * Checks whether the given access info can be commited to grants model.
     * @param info
     */
    isInfoFulfilled(info: IAccessInfo | IQueryInfo): boolean;
    /**
     * Checks whether the given name can be used and is not a reserved keyword.
     *
     * @param name - Name to be checked.
     * @param [throwOnInvalid=true] - Specifies whether to throw if
     * name is not valid.
     *
     * @throws {AccessControlError} - If `throwOnInvalid` is enabled and name
     * is invalid.
     */
    validName(name: string, throwOnInvalid?: boolean): boolean;
    /**
     * Checks whether the given array does not contain a reserved keyword.
     *
     * @param list - Name(s) to be checked.
     * @param [throwOnInvalid=true] - Specifies whether to throw if name is not
     * valid.
     *
     * @throws {AccessControlError} - If `throwOnInvalid` is enabled and name is
     * invalid.
     */
    hasValidNames(list: string | string[], throwOnInvalid?: boolean): boolean;
    /**
     * Checks whether the given object is a valid resource definition object.
     * @param o - Resource definition to be checked.
     *
     * @throws {AccessControlError} - If `throwOnInvalid` is enabled and object
     * is invalid.
     */
    validResourceObject(o: unknown): boolean;
    /**
     * Checks whether the given object is a valid role definition object.
     * @param grants - Original grants object being inspected.
     * @param roleName - Name of the role.
     *
     * @throws {AccessControlError} - If `throwOnInvalid` is enabled and object
     * is invalid.
     */
    validRoleObject(grants: IGrants, roleName: string): boolean;
    /**
     * Inspects whether the given grants object has a valid structure and
     * configuration; and returns a restructured grants object that can be used
     * internally by AccessControl.
     * @param o - Original grants object to be inspected.
     *
     * @throws {AccessControlError} - If given grants object has an invalid
     * structure or configuration.
     */
    getInspectedGrants(o: unknown): IGrants;
    /**
     * Gets all the unique resources that are granted access for at
     * least one role.
     */
    getResources(grants: IGrants): string[];
    /**
     * Normalizes the actions and possessions in the given `IQueryInfo` or
     * `IAccessInfo`.
     * @param info
     * @param [asString=false]
     *
     * @throws {AccessControlError} - If invalid action/possession found.
     */
    normalizeActionPossession(info: IQueryInfo | IAccessInfo | Partial<IGrantsListItem>, asString?: boolean): IQueryInfo | IAccessInfo | string;
    /**
     * Normalizes the roles and resources in the given `IQueryInfo`.
     * @param info
     *
     * @throws {AccessControlError} - If invalid role/resource found.
     */
    normalizeQueryInfo(query: IQueryInfo): IQueryInfo;
    /**
     * Normalizes the roles and resources in the given `IAccessInfo`.
     * @param info
     * @param [all=false] - Whether to validate all properties such
     * as `action` and `possession`.
     *
     * @throws {AccessControlError} - If invalid role/resource found.
     */
    normalizeAccessInfo(access: IAccessInfo | IGrantsListItem, all?: boolean): IAccessInfo;
    /**
     * Used to re-set (prepare) the `attributes` of an `IAccessInfo` object
     * when it's first initialized with e.g. `.grant()` or `.deny()` chain
     * methods.
     * @param access
     */
    resetAttributes(access: IAccessInfo): IAccessInfo;
    /**
     * Gets a flat, ordered list of inherited roles for the given role.
     * @param grants - Main grants object to be processed.
     * @param roleName - Role name to be inspected.
     */
    getRoleHierarchyOf(grants: IGrants, roleName: string, _rootRole?: string): string[];
    /**
     * Gets roles and extended roles in a flat array.
     */
    getFlatRoles(grants: IGrants, roles?: string | string[]): string[];
    /**
     * Checks the given grants model and gets an array of non-existent roles
     * from the given roles.
     * @param grants - Grants model to be checked.
     * @param roles - Roles to be checked.
     */
    getNonExistentRoles(grants: IGrants, roles: string[]): string[];
    /**
     * Checks whether the given extender role(s) is already (cross) inherited
     * by the given role and returns the first cross-inherited role. Otherwise,
     * returns `false`.
     *
     * Note that cross-inheritance is not allowed.
     *
     * @param grants - Grants model to be checked.
     * @param roles - Target role to be checked.
     * @param extenderRoles - Extender role(s) to be checked.
     */
    getCrossExtendingRole(grants: IGrants, roleName: string, extenderRoles: string | string[]): string | false;
    /**
     * Extends the given role(s) with privileges of one or more other roles.
     *
     * @param grants
     * @param roles - Role(s) to be extended. Single role as a `String` or
     * multiple roles as an `Array`. Note that if a role does not exist, it will
     * be automatically created.
     * @param extenderRoles - Role(s) to inherit from. Single role as a `String`
     * or multiple roles as an `Array`. Note that if a extender role does not
     * exist, it will throw.
     *
     * @throws {Error} - If a role is extended by itself, a non-existent role or a
     * cross-inherited role.
     */
    extendRole(grants: IGrants, roles: string | string[], extenderRoles: string | string[]): void;
    /**
     * `utils.commitToGrants()` method already creates the roles but it's
     * executed when the chain is terminated with either `.extend()` or an
     * action method (e.g. `.createOwn()`). In case the chain is not
     * terminated, we'll still (pre)create the role(s) with an empty object.
     * @param grants
     * @param roles
     */
    preCreateRoles(grants: IGrants, roles: string | string[]): void;
    /**
     * Commits the given `IAccessInfo` object to the grants model. CAUTION: if
     * attributes is omitted, it will default to `['*']` which means "all
     * attributes allowed".
     * @param grants
     * @param access
     * @param normalizeAll - Specifies whether to validate and normalize all
     * properties of the inner `IAccessInfo` object, including `action` and
     * `possession`.
     * @throws {Error} - If `IAccessInfo` object fails validation.
     */
    commitToGrants(grants: IGrants, access: IAccessInfo | IGrantsListItem, normalizeAll?: boolean): void;
    /**
     * When more than one role is passed, we union the permitted attributes
     * for all given roles; so we can check whether "at least one of these
     * roles" have the permission to execute this action.
     * e.g. `can(['admin', 'user']).createAny('video')`
     * @param grants
     * @param query
     */
    getUnionAttrsOfRoles(grants: IGrants, query: IQueryInfo): string[];
    /**
     * Locks the given AccessControl instance by freezing underlying grants
     * model and disabling all functionality to modify it.
     * @param ac
     */
    lockAC(ac: AccessControl): void;
    /**
     * Deep clones the source object while filtering its properties by the
     * given attributes (glob notations). Includes all matched properties and
     * removes the rest.
     * @param object - Object to be filtered.
     * @param attributes - Array of glob notations.
     */
    filter(object: UnknownObject, attributes: string[]): UnknownObject;
    /**
     * Deep clones the source array of objects or a single object while
     * filtering their properties by the given attributes (glob notations).
     * Includes all matched properties and removes the rest of each object in
     * the array.
     * @param data - Array of objects or single object to be filtered.
     * @param attributes - Array of glob notations.
     */
    filterAll(data: UnknownObject | UnknownObject[], attributes: string[]): UnknownObject | UnknownObject[];
};
