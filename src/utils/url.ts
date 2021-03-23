export type DirectionText = 'down' | 'up';
export type DirectionSymbolic = '+' | '-';

export const parseDirection = (dir: DirectionSymbolic): DirectionText => (dir === '+' ? 'up' : 'down');

export const parseOrderParam = (val: string): [DirectionText, string] => {
  const dir = val.substr(0, 1) as DirectionSymbolic;
  return [parseDirection(dir), val.substr(1)];
};

export const directionFromText = (text: DirectionText): DirectionSymbolic => (text === 'up' ? '+' : '-');

export const swapDirection = (param: string): string => {
  const [dir, prop] = parseOrderParam(param);
  return `${directionFromText(dir === 'down' ? 'up' : 'down')}${prop}`;
};

export const takeLastSplitFromURL = (str: string): string => {
  const s = str.split('/');
  return s[s.length - 1];
};
