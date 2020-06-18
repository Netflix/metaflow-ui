/** Returns a value at a given dot limited `pathStr` in a given `obj`.
    In case it was not found returns the provided `val`. */
export const pathOr = (pathStr: string) => (val: any) => (obj: any & object) => {
  let ret = obj;

  for (let x of pathStr.split('.')) {
    ret = ret[x];

    if (ret === undefined) {
      return val;
    }
  }

  return ret;
};

/** Returns a value at a given dot limited pathStr in a given obj. */
export const path = (pathStr: string) => (obj: any & object) => pathOr(pathStr)(undefined)(obj);
