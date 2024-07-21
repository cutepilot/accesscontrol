/**
 * Enumerates the possible possessions of a resource, for an action.
 * A possession defines whether the action is (or not) to be performed on "own"
 * resource(s) of the current subject or "any" resources - including "own".
 * @enum {string}
 * @readonly
 * @memberof! AccessControl
 */
export var Possession;
(function (Possession) {
    /**
     *  Indicates that the action is (or not) to be performed on <b>own</b>
     *  resource(s) of the current subject.
     */
    Possession["OWN"] = "own";
    /**
     *  Indicates that the action is (or not) to be performed on <b>any</b>
     *  resource(s); including <i>own</i> resource(s) of the current subject.
     */
    Possession["ANY"] = "any";
})(Possession || (Possession = {}));
;
//# sourceMappingURL=Possession.js.map