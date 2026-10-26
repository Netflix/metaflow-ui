import { DEFAULT_TIME_FILTER_DAYS, parseTimeFilterDays } from '../constants';

describe('Constants', () => {
  it('parseTimeFilterDays() - parses days as base 10', () => {
    expect(parseTimeFilterDays('1')).to.equal(1);
    expect(parseTimeFilterDays('7')).to.equal(7);
    expect(parseTimeFilterDays('10')).to.equal(10);
    expect(parseTimeFilterDays('14')).to.equal(14);
    expect(parseTimeFilterDays('30')).to.equal(30);
    expect(parseTimeFilterDays('365')).to.equal(365);
  });

  it('parseTimeFilterDays() - ignores values that are not a positive number of days', () => {
    expect(parseTimeFilterDays(undefined)).to.equal(undefined);
    expect(parseTimeFilterDays('')).to.equal(undefined);
    expect(parseTimeFilterDays('0')).to.equal(undefined);
    expect(parseTimeFilterDays('-5')).to.equal(undefined);
    expect(parseTimeFilterDays('abc')).to.equal(undefined);
  });

  it('DEFAULT_TIME_FILTER_DAYS - defaults to 30', () => {
    expect(DEFAULT_TIME_FILTER_DAYS).to.equal(30);
  });
});
