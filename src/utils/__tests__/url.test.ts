import { directionFromText, parseDirection, parseOrderParam } from '../url';

describe('Url utils', () => {
  test('parseDirection', () => {
    expect(parseDirection('+')).toBe('up');
    expect(parseDirection('-')).toBe('down');
  });

  test('parseOrderParam', () => {
    expect(parseOrderParam('+order')).toEqual(['up', 'order']);
    expect(parseOrderParam('-order')).toEqual(['down', 'order']);
  });

  test('directionFromText', () => {
    expect(directionFromText('up')).toBe('+');
    expect(directionFromText('down')).toBe('-');
  });
});
