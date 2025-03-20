import spacetime from 'spacetime';

export const getISOString = (date: Date, timezone?: string): string => {
  if (timezone) {
    return spacetime(date, 'GMT+0').goto(`${timezone}`).unixFmt('MM-dd-yyyy HH:mm:ss');
  }
  return spacetime(date, 'GMT+0').unixFmt('MM-dd-yyyy HH:mm:ss');
};

export const getTimestampString = (date: Date, timezone?: string): string => {
  if (timezone) {
    return spacetime(date, 'GMT+0').goto(`${timezone}`).unixFmt('HH:mm:ss');
  }
  return spacetime(date, 'GMT+0').unixFmt('HH:mm:ss');
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

export const getCalendarDateTimeString = (date: Date, timezone?: string): string => {
  if (timezone) {
    return spacetime(date, 'GMT+0').goto(`${timezone}`).unixFmt('MMM dd, yyyy hh:mm:ss');
  }
  return spacetime(date, 'GMT+0').unixFmt('MMM dd, yyyy hh:mm:ss');
};

// Return timepoint X days from now.
export const getTimeFromPastByDays = (days: number, timezone?: string): number => {
  if (timezone) {
    return spacetime.now(`${timezone}`).subtract(days, 'day').startOf('day').epoch;
  }
  return spacetime(Date.now() - 1000 * 60 * 60 * 24 * days).startOf('day').epoch;
};
