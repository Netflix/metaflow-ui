import spacetime from 'spacetime';

export const getISOString = (date: Date, timezone?: number): string => {
  if (timezone && timezone !== 0) {
    return spacetime(date, 'GMT+0')
      .goto(`GMT${timezone > 0 ? '+' : ''}${timezone}`)
      .unixFmt('MM-dd-yyyy HH:mm');
  }
  return spacetime(date, 'GMT+0').unixFmt('MM-dd-yyyy HH:mm');
};
