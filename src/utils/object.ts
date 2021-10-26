export const fromPairs = <T>(ps: [string, T][]): Record<string, T> =>
  ps.reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

export const omit = <T>(keys: string[], obj: Record<string, T>): Record<string, T> =>
  fromPairs<T>(Object.entries(obj).filter((v) => !keys.includes(v[0])));
