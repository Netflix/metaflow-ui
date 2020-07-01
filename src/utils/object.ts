export const fromPairs = <T>(ps: [string, unknown][]): Record<string, T> =>
  ps.reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
