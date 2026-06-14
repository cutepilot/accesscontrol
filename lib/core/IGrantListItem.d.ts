import { Action, Possession } from '../enums';
/**
 * An interface that defines grant list item
 * @see IAccessInfo
 */
export interface IGrantListItem {
    role: string | string[];
    resource: string | string[];
    action: typeof Action[keyof typeof Action];
    possession?: typeof Possession[keyof typeof Possession];
    attributes?: string | string[];
}
