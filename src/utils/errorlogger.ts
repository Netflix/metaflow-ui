import VERSION_INFO from '../VERSION';

export function logWarning(...arg: any[]): void {
  console.warn(...arg);
  console.log('Version information: ', VERSION_INFO);
}