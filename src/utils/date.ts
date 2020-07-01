export const getISOString = (date: Date) => {
  return date
    .toISOString()
    .split('T')
    .map((dp) => dp.split('.').slice(0, 1).join(''))
    .join(' ');
};