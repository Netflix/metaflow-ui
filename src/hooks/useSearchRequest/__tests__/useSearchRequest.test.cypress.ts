import { parseSearchValue } from '..';

describe('useSearchRequest', () => {
  it('parseSearchValue', () => {
    expect(parseSearchValue('')).to.equal(null);
    expect(parseSearchValue('test')).to.eql({ key: 'test', scope: '' });
    expect(parseSearchValue('test:')).to.eql({ key: 'test', scope: '' });
    expect(parseSearchValue('test: ')).to.eql({ key: 'test', scope: '' });
    expect(parseSearchValue('test : ')).to.eql({ key: 'test ', scope: '' });
    expect(parseSearchValue('test :val')).to.eql({ key: 'test ', value: 'val', scope: '' });
    expect(parseSearchValue('test :val ')).to.eql({ key: 'test ', value: 'val', scope: '' });
  });
});
