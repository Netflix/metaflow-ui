import spacetime from 'spacetime';

export const getISOString = (date: Date, timezone?: string): string => {
  if (timezone) {
    return spacetime(date, 'GMT+0').goto(`${timezone}`).unixFmt('MM-dd-yyyy HH:mm:ss');
  }
  return spacetime(date, 'GMT+0').unixFmt('MM-dd-yyyy HH:mm:ss');
};

export const getTimeRangeString = (date: Date, timezone?: string): string => {
  if (timezone) {
    return spacetime(date, 'GMT+0').goto(`${timezone}`).unixFmt('yyyy-MM-dd HH:mm');
  }
  return spacetime(date, 'GMT+0').unixFmt('yyyy-MM-dd HH:mm');
};

export const getDateTimeLocalString = (date: Date, timezone?: string): string => {
  if (timezone) {
    return spacetime(date, 'GMT+0').goto(`${timezone}`).unixFmt('yyyy-MM-ddTHH:mm');
  }
  return spacetime(date, 'GMT+0').unixFmt('yyyy-MM-ddTHH:mm');
};
