import { directionFromText, parseDirection, parseOrderParam } from '../url';

describe('Url utils', () => {
  it('parseDirection', () => {
    expect(parseDirection('+')).to.equal('up');
    expect(parseDirection('-')).to.equal('down');
  });

  it('parseOrderParam', () => {
    expect(parseOrderParam('+order')).to.eql(['up', 'order']);
    expect(parseOrderParam('-order')).to.eql(['down', 'order']);
  });

  it('directionFromText', () => {
    expect(directionFromText('up')).to.equal('+');
    expect(directionFromText('down')).to.equal('-');
  });
});
