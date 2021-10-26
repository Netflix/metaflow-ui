import { parseSearchValue } from '..';

describe('useSearchRequest', () => {
  it('parseSearchValue', () => {
    expect(parseSearchValue('')).to.equal(null);
    expect(parseSearchValue('test')).to.eql({ key: 'test' });
    expect(parseSearchValue('test:')).to.eql({ key: 'test' });
    expect(parseSearchValue('test: ')).to.eql({ key: 'test' });
    expect(parseSearchValue('test : ')).to.eql({ key: 'test ' });
    expect(parseSearchValue('test :val')).to.eql({ key: 'test ', value: 'val' });
    expect(parseSearchValue('test :val ')).to.eql({ key: 'test ', value: 'val' });
  });
});
