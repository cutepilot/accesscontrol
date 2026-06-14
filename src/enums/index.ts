import { Action } from './Action.js';
import { Possession } from './Possession.js';

const actions: string[] = Object.keys(Action).map((k: string) => Action[k]);
const possessions: string[] = Object.keys(Possession).map((k: string) => Possession[k]);

export {
  Action,
  actions,
  Possession,
  possessions
};
