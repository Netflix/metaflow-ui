export const flatten = <T>(arr: Array<T | T[]>): T[] =>
  arr.reduce<T[]>((acc, cur) => acc.concat(Array.isArray(cur) ? flatten(cur) : [cur]), []);

export const pluck = <T, K extends keyof T>(prop: K, arr: T[] | null | undefined): T[K][] =>
  arr ? arr.reduce<T[K][]>((acc, cur) => (!acc.includes(cur[prop]) ? acc.concat(cur[prop]) : acc), []) : [];
