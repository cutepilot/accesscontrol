import { AccessControl } from '../src/index.js';
import { AccessControlError } from '../src/core/index.js';

export const helper = {
  expectACError(fn: any, errMsg?: string) {
    expect(fn).toThrow();
    try {
      fn();
    } catch (err) {
      expect(err instanceof AccessControlError).toEqual(true);
      expect(AccessControl.isAccessControlError(err)).toEqual(true);
      expect(AccessControl.isACError(err)).toEqual(true); // alias test
      if (errMsg) expect((err as Error).message).toContain(errMsg);
    }
  }

};
