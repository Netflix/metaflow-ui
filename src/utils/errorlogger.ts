// import { getVersionInfo } from './VERSION';

export function logWarning(str: string, ...arg: unknown[]): void {
  console.warn(str, ...arg);
  // console.log('Version information: ', getVersionInfo());
}
