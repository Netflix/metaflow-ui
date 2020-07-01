export const fromPairs = (ps: [string, unknown][]) => ps.reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
