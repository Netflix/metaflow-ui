export const flatten = (arr: any[]): any[] =>
  arr.reduce((acc, cur): any[] => acc.concat(Array.isArray(cur) ? flatten(cur) : cur), []);

export const pluck = <T, K>(prop: keyof T, arr: T[]): K[] =>
  arr.reduce<K[]>((acc, cur) => (!acc.includes(cur[prop] as any) ? acc.concat(cur[prop] as any) : acc), []);
