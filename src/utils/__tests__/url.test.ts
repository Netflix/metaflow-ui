import { directionFromText, parseDirection, parseOrderParam } from '../url';

describe('Url utils', () => {
  test('parseDirection', () => {
    expect(parseDirection('+')).toBe('down');
    expect(parseDirection('-')).toBe('up');
  });

  test('parseOrderParam', () => {
    expect(parseOrderParam('+order')).toEqual(['down', 'order']);
    expect(parseOrderParam('-order')).toEqual(['up', 'order']);
  });

  test('directionFromText', () => {
    expect(directionFromText('down')).toBe('+');
    expect(directionFromText('up')).toBe('-');
  });
});
