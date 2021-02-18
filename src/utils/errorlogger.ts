import { getVersionInfo } from '../VERSION';
import { analyticsSendException } from './analytics';

export function logWarning(str: string, ...arg: any[]): void {
  console.warn(str, ...arg);
  console.log('Version information: ', getVersionInfo());
  analyticsSendException(str, false);
}
