export const getISOString = (date: Date): string => {
  return date
    .toISOString()
    .split('T')
    .map((dp) => dp.split('.').slice(0, 1).join(''))
    .join(' ');
};
