import { setLogItem } from './debugdb';

export function logWarning(str: string, ...arg: unknown[]): void {
  console.warn(str, ...arg);
  setLogItem(`WARN ${str}${arg.length ? ' ' + JSON.stringify(arg) : ''}`);
}
