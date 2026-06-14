/**
 * Enumerates the possible actions of a role.
 * An action defines the type of an operation that will be executed on a
 * "resource" by a "role".
 * This is known as CRUD (CREATE, READ, UPDATE, DELETE).
 * @enum {string}
 * @readonly
 * @memberof! AccessControl
 */
export var Action;
(function (Action) {
    /**
     *  Specifies a CREATE action to be performed on a resource.
     *  For example, an HTTP POST request or an INSERT database operation.
     */
    Action["CREATE"] = "create";
    /**
     *  Specifies a READ action to be performed on a resource.
     *  For example, an HTTP GET request or an database SELECT operation.
     */
    Action["READ"] = "read";
    /**
     *  Specifies an UPDATE action to be performed on a resource.
     *  For example, an HTTP PUT or POST request or an database UPDATE operation.
     */
    Action["UPDATE"] = "update";
    /**
     *  Specifies a DELETE action to be performed on a resource.
     *  For example, an HTTP DELETE request or a database DELETE operation.
     */
    Action["DELETE"] = "delete";
})(Action || (Action = {}));
;
//# sourceMappingURL=Action.js.map