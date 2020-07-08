type Handler = (k: string, v: string) => void;

export function getParamChangeHandler(params: URLSearchParams, fn: (q: string) => void): Handler {
  return (key, value) => {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    fn(params.toString());
  };
}

export type DirectionText = 'down' | 'up';
export type DirectionSymbolic = '+' | '-';

export const parseDirection = (dir: DirectionSymbolic): DirectionText => (dir === '+' ? 'down' : 'up');

export const parseOrderParam = (val: string): [DirectionText, string] => {
  const dir = val.substr(0, 1) as DirectionSymbolic;
  return [parseDirection(dir), val.substr(1)];
};

export const directionFromText = (text: DirectionText): DirectionSymbolic => (text === 'down' ? '+' : '-');

export const swapDirection = (param: string): string => {
  const [dir, prop] = parseOrderParam(param);
  return `${directionFromText(dir === 'down' ? 'up' : 'down')}${prop}`;
};
