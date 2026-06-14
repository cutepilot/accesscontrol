import { Action } from './Action.js';
import { Possession } from './Possession.js';
const actions = Object.keys(Action).map((k) => Action[k]);
const possessions = Object.keys(Possession).map((k) => Possession[k]);
export { Action, actions, Possession, possessions };
//# sourceMappingURL=index.js.map