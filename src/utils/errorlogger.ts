import { getVersionInfo } from '../VERSION';

export function logWarning(...arg: any[]): void {
  console.warn(...arg);
  console.log('Version information: ', getVersionInfo());
}
