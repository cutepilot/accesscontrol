// dep modules
import { Notation } from 'notation';
import { AccessControlError } from './core/index.js';
import { actions, Possession, possessions } from './enums/index.js';
/**
 * List of reserved keywords.
 * i.e. Roles, resources with these names are not allowed.
 */
export const RESERVED_KEYWORDS = ['*', '!', '$', '$extend'];
/**
 * Error message to be thrown after AccessControl instance is locked.
 */
export const ERR_LOCK = 'Cannot alter the underlying grants model. AccessControl instance is locked.';
export const utils = {
    // ----------------------
    // GENERIC UTILS
    // ----------------------
    /**
     * Gets the type of the given object.
     * @param o
     */
    type(o) {
        return Object.prototype.toString.call(o).match(/\s(\w+)/i)[1].toLowerCase();
    },
    /**
     * Specifies whether the given value is set (other that `null` or
     * `undefined`).
     * @param o - Value to be checked.
     */
    // isset(o:any):boolean {
    //     return o === null || o === undefined;
    // },
    /**
     * Specifies whether the property/key is defined on the given object.
     * @param o
     * @param propName
     */
    hasDefined(o, propName) {
        return o.hasOwnProperty(propName) && o[propName] !== undefined;
    },
    /**
     * Converts the given (string) value into an array of string. Note that
     * this does not throw if the value is not a string or array. It will
     * silently return `[]` (empty array). So where ever it's used, the host
     * function should consider throwing.
     * @param value
     */
    toStringArray(value) {
        if (Array.isArray(value))
            return value;
        if (typeof value === 'string')
            return value.trim().split(/\s*[;,]\s*/);
        // throw new Error('Expected a string or array of strings, got ' + utils.type(value));
        return [];
    },
    /**
     * Checks whether the given array consists of non-empty string items.
     * (Array can be empty but no item should be an empty string.)
     * @param arr - Array to be checked.
     */
    isFilledStringArray(arr) {
        if (!arr || !Array.isArray(arr))
            return false;
        for (let s of arr) {
            if (typeof s !== 'string' || s.trim() === '')
                return false;
        }
        return true;
    },
    /**
     * Checks whether the given value is an empty array.
     * @param value - Value to be checked.
     */
    isEmptyArray(value) {
        return Array.isArray(value) && value.length === 0;
    },
    /**
     * Ensures that the pushed item is unique in the target array.
     * @param arr - Target array.
     * @param item - Item to be pushed to array.
     */
    pushUniq(arr, item) {
        if (arr.indexOf(item) < 0)
            arr.push(item);
        return arr;
    },
    /**
     * Concats the given two arrays and ensures all items are unique.
     * @param arrA
     * @param arrB
     */
    uniqConcat(arrA, arrB) {
        const arr = arrA.concat();
        arrB.forEach((b) => {
            utils.pushUniq(arr, b);
        });
        return arr;
    },
    /**
     * Subtracts the second array from the first.
     * @param arrA
     * @param arrB
     */
    subtractArray(arrA, arrB) {
        return arrA.concat().filter(a => arrB.indexOf(a) === -1);
    },
    /**
     * Deep freezes the given object.
     * @param o - Object to be frozen.
     */
    deepFreeze(o) {
        // Object.freeze accepts also an array. But here, we only use this for
        // objects.
        if (utils.type(o) !== 'object')
            return;
        const props = Object.getOwnPropertyNames(o);
        // freeze deeper before self
        props.forEach((key) => {
            let sub = o[key];
            if (Array.isArray(sub))
                Object.freeze(sub);
            if (utils.type(sub) === 'object') {
                utils.deepFreeze(sub);
            }
        });
        // finally freeze self
        return Object.freeze(o);
    },
    /**
     * Similar to JS .forEach, except this allows for breaking out early,
     * (before all iterations are executed) by returning `false`.
     * @param array
     * @param callback
     * @param thisArg
     */
    each(array, callback, thisArg = null) {
        const length = array.length;
        let index = -1;
        while (++index < length) {
            if (callback.call(thisArg, array[index], index, array) === false)
                break;
        }
    },
    /**
     * Iterates through the keys of the given object. Breaking out early is
     * possible by returning `false`.
     * @param object
     * @param callback
     * @param thisArg
     */
    eachKey(object, callback, thisArg = null) {
        // return Object.keys(o).forEach(callback);
        // forEach has no way to interrupt execution, short-circuit unless an
        // error is thrown. so we use this:
        utils.each(Object.keys(object), callback, thisArg);
    },
    // ----------------------
    // AC ITERATION UTILS
    // ----------------------
    eachRole(grants, callback) {
        utils.eachKey(grants, (name) => callback(grants[name], name));
    },
    /**
     *
     */
    eachRoleResource(grants, callback) {
        let roleInfo;
        let resourceInfo;
        utils.eachKey(grants, (role) => {
            roleInfo = grants[role];
            utils.eachKey(roleInfo, (resource) => {
                if (utils.validName(resource, false)) {
                    resourceInfo = roleInfo[resource];
                    callback(role, resource, resourceInfo);
                }
            });
        });
    },
    // ----------------------
    // AC VALIDATION UTILS
    // ----------------------
    /**
     * Checks whether the given access info can be commited to grants model.
     * @param info
     */
    isInfoFulfilled(info) {
        return utils.hasDefined(info, 'role')
            && utils.hasDefined(info, 'action')
            && utils.hasDefined(info, 'resource');
    },
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
    validName(name, throwOnInvalid = true) {
        if (typeof name !== 'string' || name.trim() === '') {
            if (!throwOnInvalid)
                return false;
            throw new AccessControlError('Invalid name, expected a valid string.');
        }
        if (RESERVED_KEYWORDS.indexOf(name) >= 0) {
            if (!throwOnInvalid)
                return false;
            throw new AccessControlError(`Cannot use reserved name: "${name}"`);
        }
        return true;
    },
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
    hasValidNames(list, throwOnInvalid = true) {
        let allValid = true;
        utils.each(utils.toStringArray(list), (name) => {
            if (!utils.validName(name, throwOnInvalid)) {
                allValid = false;
                return false; // break out of loop
            }
            return true; // continue
        });
        return allValid;
    },
    /**
     * Checks whether the given object is a valid resource definition object.
     * @param o - Resource definition to be checked.
     *
     * @throws {AccessControlError} - If `throwOnInvalid` is enabled and object
     * is invalid.
     */
    validResourceObject(o) {
        if (utils.type(o) !== 'object') {
            throw new AccessControlError(`Invalid resource definition.`);
        }
        utils.eachKey(o, (action) => {
            let s = action.split(':');
            if (actions.indexOf(s[0]) === -1) {
                throw new AccessControlError(`Invalid action: "${action}"`);
            }
            if (s[1] && possessions.indexOf(s[1]) === -1) {
                throw new AccessControlError(`Invalid action possession: "${action}"`);
            }
            let perms = o[action];
            if (!utils.isEmptyArray(perms) && !utils.isFilledStringArray(perms)) {
                throw new AccessControlError(`Invalid resource attributes for action "${action}".`);
            }
        });
        return true;
    },
    /**
     * Checks whether the given object is a valid role definition object.
     * @param grants - Original grants object being inspected.
     * @param roleName - Name of the role.
     *
     * @throws {AccessControlError} - If `throwOnInvalid` is enabled and object
     * is invalid.
     */
    validRoleObject(grants, roleName) {
        let role = grants[roleName];
        if (!role || utils.type(role) !== 'object') {
            throw new AccessControlError(`Invalid role definition.`);
        }
        utils.eachKey(role, (resourceName) => {
            if (!utils.validName(resourceName, false)) {
                if (resourceName === '$extend') {
                    let extRoles = role.$extend ?? []; // semantics
                    if (!utils.isFilledStringArray(extRoles)) {
                        throw new AccessControlError(`Invalid extend value for role "${roleName}": ${JSON.stringify(extRoles)}`);
                    }
                    else {
                        // attempt to actually extend the roles. this will throw
                        // on failure.
                        utils.extendRole(grants, roleName, extRoles);
                    }
                }
                else {
                    throw new AccessControlError(`Cannot use reserved name "${resourceName}" for a resource.`);
                }
            }
            else {
                utils.validResourceObject(role[resourceName]); // throws on failure
            }
        });
        return true;
    },
    /**
     * Inspects whether the given grants object has a valid structure and
     * configuration; and returns a restructured grants object that can be used
     * internally by AccessControl.
     * @param o - Original grants object to be inspected.
     *
     * @throws {AccessControlError} - If given grants object has an invalid
     * structure or configuration.
     */
    getInspectedGrants(o) {
        let grants = {};
        const strErr = 'Invalid grants object.';
        const type = utils.type(o);
        if (type === 'object') {
            utils.eachKey(o, (roleName) => {
                if (utils.validName(roleName)) { // throws on failure
                    return utils.validRoleObject(o, roleName); // throws on failure
                }
                /* istanbul ignore next */
                return false;
                // above is redundant, previous checks will already throw on
                // failure so we'll never need to break early from this.
            });
            grants = o;
        }
        else if (type === 'array') {
            o.forEach((item) => utils.commitToGrants(grants, item, true));
        }
        else {
            throw new AccessControlError(`${strErr} Expected an array or object.`);
        }
        return grants;
    },
    // ----------------------
    // AC COMMON UTILS
    // ----------------------
    /**
     * Gets all the unique resources that are granted access for at
     * least one role.
     */
    getResources(grants) {
        // using an object for unique list
        let resources = {};
        utils.eachRoleResource(grants, (role, resource, resourceInfo) => {
            resources[resource] = null;
        });
        return Object.keys(resources);
    },
    /**
     * Normalizes the actions and possessions in the given `IQueryInfo` or
     * `IAccessInfo`.
     * @param info
     * @param [asString=false]
     *
     * @throws {AccessControlError} - If invalid action/possession found.
     */
    normalizeActionPossession(info, asString = false) {
        // validate and normalize action
        if (typeof info.action !== 'string') {
            // throw new AccessControlError(`Invalid action: ${info.action}`);
            throw new AccessControlError(`Invalid action: ${JSON.stringify(info)}`);
        }
        const s = info.action.split(':');
        if (actions.indexOf(s[0].trim().toLowerCase()) < 0) {
            throw new AccessControlError(`Invalid action: ${s[0]}`);
        }
        info.action = s[0].trim().toLowerCase();
        // validate and normalize possession
        const poss = info.possession || s[1];
        if (poss) {
            if (possessions.indexOf(poss.trim().toLowerCase()) < 0) {
                throw new AccessControlError(`Invalid action possession: ${poss}`);
            }
            else {
                info.possession = poss.trim().toLowerCase();
            }
        }
        else {
            // if no possession is set, we'll default to "any".
            info.possession = Possession.ANY;
        }
        return asString
            ? info.action + ':' + info.possession
            : info;
    },
    /**
     * Normalizes the roles and resources in the given `IQueryInfo`.
     * @param info
     *
     * @throws {AccessControlError} - If invalid role/resource found.
     */
    normalizeQueryInfo(query) {
        if (utils.type(query) !== 'object') {
            throw new AccessControlError(`Invalid IQueryInfo: ${typeof query}`);
        }
        // clone the object
        query = Object.assign({}, query);
        // validate and normalize role(s)
        query.role = utils.toStringArray(query.role);
        if (!utils.isFilledStringArray(query.role)) {
            throw new AccessControlError(`Invalid role(s): ${JSON.stringify(query.role)}`);
        }
        // validate resource
        if (typeof query.resource !== 'string' || query.resource.trim() === '') {
            throw new AccessControlError(`Invalid resource: "${query.resource}"`);
        }
        query.resource = query.resource.trim();
        query = utils.normalizeActionPossession(query);
        return query;
    },
    /**
     * Normalizes the roles and resources in the given `IAccessInfo`.
     * @param info
     * @param [all=false] - Whether to validate all properties such
     * as `action` and `possession`.
     *
     * @throws {AccessControlError} - If invalid role/resource found.
     */
    normalizeAccessInfo(access, all = false) {
        if (utils.type(access) !== 'object') {
            throw new AccessControlError(`Invalid IAccessInfo: ${typeof access}`);
        }
        // clone the object
        let accessInfo = Object.assign({}, access);
        // validate and normalize role(s)
        accessInfo.role = utils.toStringArray(accessInfo.role);
        if (accessInfo.role.length === 0 || !utils.isFilledStringArray(accessInfo.role)) {
            throw new AccessControlError(`Invalid role(s): ${JSON.stringify(accessInfo.role)}`);
        }
        // validate and normalize resource
        accessInfo.resource = utils.toStringArray(accessInfo.resource);
        if (accessInfo.resource.length === 0 || !utils.isFilledStringArray(accessInfo.resource)) {
            throw new AccessControlError(`Invalid resource(s): ${JSON.stringify(accessInfo.resource)}`);
        }
        // normalize attributes
        if (accessInfo.denied || (Array.isArray(accessInfo.attributes) && accessInfo.attributes.length === 0)) {
            accessInfo.attributes = [];
        }
        else {
            // if omitted and not denied, all attributes are allowed
            accessInfo.attributes = !accessInfo.attributes ? ['*'] : utils.toStringArray(accessInfo.attributes);
        }
        // this part is not necessary if this is invoked from a comitter method
        // such as `createAny()`. So we'll check if we need to validate all
        // properties such as `action` and `possession`.
        if (all)
            accessInfo = utils.normalizeActionPossession(accessInfo);
        return accessInfo;
    },
    /**
     * Used to re-set (prepare) the `attributes` of an `IAccessInfo` object
     * when it's first initialized with e.g. `.grant()` or `.deny()` chain
     * methods.
     * @param access
     */
    resetAttributes(access) {
        if (access.denied) {
            access.attributes = [];
            return access;
        }
        if (!access.attributes || utils.isEmptyArray(access.attributes)) {
            access.attributes = ['*'];
        }
        return access;
    },
    /**
     * Gets a flat, ordered list of inherited roles for the given role.
     * @param grants - Main grants object to be processed.
     * @param roleName - Role name to be inspected.
     */
    getRoleHierarchyOf(grants, roleName, _rootRole) {
        // `rootRole` is for memory storage. Do NOT set it when using;
        // and do NOT document this paramter.
        // rootRole = rootRole || roleName;
        const role = grants[roleName];
        if (!role)
            throw new AccessControlError(`Role not found: "${roleName}"`);
        let arr = [roleName];
        if (!Array.isArray(role.$extend) || role.$extend.length === 0)
            return arr;
        role.$extend.forEach((exRoleName) => {
            if (!grants[exRoleName]) {
                throw new AccessControlError(`Role not found: "${grants[exRoleName]}"`);
            }
            if (exRoleName === roleName) {
                throw new AccessControlError(`Cannot extend role "${roleName}" by itself.`);
            }
            // throw if cross-inheritance and also avoid memory leak with
            // maximum call stack error
            if (_rootRole && (_rootRole === exRoleName)) {
                throw new AccessControlError(`Cross inheritance is not allowed. Role "${exRoleName}" already extends "${_rootRole}".`);
            }
            let ext = utils.getRoleHierarchyOf(grants, exRoleName, _rootRole || roleName);
            arr = utils.uniqConcat(arr, ext);
        });
        return arr;
    },
    /**
     * Gets roles and extended roles in a flat array.
     */
    getFlatRoles(grants, roles) {
        const arrRoles = utils.toStringArray(roles || []);
        if (arrRoles.length === 0) {
            throw new AccessControlError(`Invalid role(s): ${JSON.stringify(roles)}`);
        }
        let arr = utils.uniqConcat([], arrRoles); // roles.concat();
        arrRoles.forEach((roleName) => {
            arr = utils.uniqConcat(arr, utils.getRoleHierarchyOf(grants, roleName));
        });
        // console.log(`flat roles for ${roles}`, arr);
        return arr;
    },
    /**
     * Checks the given grants model and gets an array of non-existent roles
     * from the given roles.
     * @param grants - Grants model to be checked.
     * @param roles - Roles to be checked.
     */
    getNonExistentRoles(grants, roles) {
        let non = [];
        if (utils.isEmptyArray(roles))
            return non;
        for (let role of roles) {
            if (!grants.hasOwnProperty(role))
                non.push(role);
        }
        return non;
    },
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
    getCrossExtendingRole(grants, roleName, extenderRoles) {
        const extenders = utils.toStringArray(extenderRoles);
        let crossInherited = false;
        utils.each(extenders, (e) => {
            if (crossInherited || roleName === e) {
                return false; // break out of loop
            }
            const inheritedByExtender = utils.getRoleHierarchyOf(grants, e);
            utils.each(inheritedByExtender, (r) => {
                if (r === roleName) {
                    // get/report the parent role
                    crossInherited = e;
                    return false; // break out of loop
                }
                return true; // continue
            });
            return true; // continue
        });
        return crossInherited;
    },
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
    extendRole(grants, roles, extenderRoles) {
        // roles cannot be omitted or an empty array
        roles = utils.toStringArray(roles);
        if (roles.length === 0) {
            throw new AccessControlError(`Invalid role(s): ${JSON.stringify(roles)}`);
        }
        // extenderRoles cannot be omitted or but can be an empty array
        if (utils.isEmptyArray(extenderRoles))
            return;
        const arrExtRoles = utils.toStringArray(extenderRoles).concat();
        if (arrExtRoles.length === 0) {
            throw new AccessControlError(`Cannot inherit invalid role(s): ${JSON.stringify(extenderRoles)}`);
        }
        const nonExistentExtRoles = utils.getNonExistentRoles(grants, arrExtRoles);
        if (nonExistentExtRoles.length > 0) {
            throw new AccessControlError(`Cannot inherit non-existent role(s): "${nonExistentExtRoles.join(', ')}"`);
        }
        roles.forEach((roleName) => {
            if (!grants[roleName])
                throw new AccessControlError(`Role not found: "${roleName}"`);
            if (arrExtRoles.indexOf(roleName) >= 0) {
                throw new AccessControlError(`Cannot extend role "${roleName}" by itself.`);
            }
            // getCrossExtendingRole() returns false or the first
            // cross-inherited role, if found.
            let crossInherited = utils.getCrossExtendingRole(grants, roleName, arrExtRoles);
            if (crossInherited) {
                throw new AccessControlError(`Cross inheritance is not allowed. Role "${crossInherited}" already extends "${roleName}".`);
            }
            utils.validName(roleName); // throws if false
            let r = grants[roleName];
            if (Array.isArray(r.$extend)) {
                r.$extend = utils.uniqConcat(r.$extend, arrExtRoles);
            }
            else {
                r.$extend = arrExtRoles;
            }
        });
    },
    /**
     * `utils.commitToGrants()` method already creates the roles but it's
     * executed when the chain is terminated with either `.extend()` or an
     * action method (e.g. `.createOwn()`). In case the chain is not
     * terminated, we'll still (pre)create the role(s) with an empty object.
     * @param grants
     * @param roles
     */
    preCreateRoles(grants, roles) {
        if (typeof roles === 'string')
            roles = utils.toStringArray(roles);
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new AccessControlError(`Invalid role(s): ${JSON.stringify(roles)}`);
        }
        roles.forEach((role) => {
            if (utils.validName(role) && !grants.hasOwnProperty(role)) {
                grants[role] = {};
            }
        });
    },
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
    commitToGrants(grants, access, normalizeAll = false) {
        const accessInfo = utils.normalizeAccessInfo(access, normalizeAll);
        // console.log(accessInfo);
        // grant.role also accepts an array, so treat it like it.
        accessInfo.role.forEach((role) => {
            if (utils.validName(role) && !grants.hasOwnProperty(role)) {
                grants[role] = {};
            }
            let grantItem = grants[role];
            let ap = accessInfo.action + ':' + accessInfo.possession;
            accessInfo.resource.forEach((res) => {
                if (utils.validName(res) && !grantItem.hasOwnProperty(res)) {
                    grantItem[res] = {};
                }
                // If possession (in action value or as a separate property) is
                // omitted, it will default to "any". e.g. "create" —>
                // "create:any"
                grantItem[res][ap] = utils.toStringArray(accessInfo.attributes);
            });
        });
    },
    /**
     * When more than one role is passed, we union the permitted attributes
     * for all given roles; so we can check whether "at least one of these
     * roles" have the permission to execute this action.
     * e.g. `can(['admin', 'user']).createAny('video')`
     * @param grants
     * @param query
     */
    getUnionAttrsOfRoles(grants, query) {
        // throws if has any invalid property value
        query = utils.normalizeQueryInfo(query);
        let role;
        let resource;
        let attrsList = [];
        // get roles and extended roles in a flat array
        const roles = utils.getFlatRoles(grants, query.role);
        // iterate through roles and add permission attributes (array) of
        // each role to attrsList (array).
        roles.forEach((roleName, index) => {
            role = grants[roleName];
            // no need to check role existence #getFlatRoles() does that.
            if (query.resource) {
                resource = role[query.resource];
                // e.g. resource['create:own']
                // If action has possession "any", it will also return
                // `granted=true` for "own", if "own" is not defined.
                attrsList.push((resource[query.action + ':' + query.possession]
                    || resource[query.action + ':any']
                    || []).concat());
                // console.log(resource, 'for:', action + '.' + possession);
            }
        });
        // union all arrays of (permitted resource) attributes (for each role)
        // into a single array.
        let attrs = [];
        const len = attrsList.length;
        if (len > 0) {
            attrs = attrsList[0];
            let i = 1;
            while (i < len) {
                attrs = Notation.Glob.union(attrs, attrsList[i]);
                i++;
            }
        }
        return attrs;
    },
    /**
     * Locks the given AccessControl instance by freezing underlying grants
     * model and disabling all functionality to modify it.
     * @param ac
     */
    lockAC(ac) {
        const _ac = ac;
        if (!_ac._grants || Object.keys(_ac._grants).length === 0) {
            throw new AccessControlError('Cannot lock empty or invalid grants model.');
        }
        let locked = ac.isLocked && Object.isFrozen(_ac._grants);
        if (!locked)
            locked = Boolean(utils.deepFreeze(_ac._grants));
        /* istanbul ignore next */
        if (!locked) {
            throw new AccessControlError(`Could not lock grants: ${typeof _ac._grants}`);
        }
        _ac._isLocked = locked;
    },
    // ----------------------
    // NOTATION/GLOB UTILS
    // ----------------------
    /**
     * Deep clones the source object while filtering its properties by the
     * given attributes (glob notations). Includes all matched properties and
     * removes the rest.
     * @param object - Object to be filtered.
     * @param attributes - Array of glob notations.
     */
    filter(object, attributes) {
        if (!Array.isArray(attributes) || attributes.length === 0) {
            return {};
        }
        const notation = new Notation(object);
        return notation.filter(attributes).value;
    },
    /**
     * Deep clones the source array of objects or a single object while
     * filtering their properties by the given attributes (glob notations).
     * Includes all matched properties and removes the rest of each object in
     * the array.
     * @param data - Array of objects or single object to be filtered.
     * @param attributes - Array of glob notations.
     */
    filterAll(data, attributes) {
        if (!Array.isArray(data)) {
            return utils.filter(data, attributes);
        }
        return data.map((o) => {
            return utils.filter(o, attributes);
        });
    }
};
//# sourceMappingURL=utils.js.map