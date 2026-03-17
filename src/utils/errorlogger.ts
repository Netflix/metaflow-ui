import { getVersionInfo } from './VERSION';
import { setLogItem } from './debugdb';

/**
 * Log a warning to both the browser console and the IndexedDB debug log.
 * The debug log can be downloaded via the debug panel, making these warnings
 * available in crash reports even when the DevTools console is not open.
 */
export function logWarning(str: string, ...arg: unknown[]): void {
  const detail = arg.length > 0 ? ` — ${JSON.stringify(arg)}` : '';
  setLogItem(`WARN ${str}${detail}`);
  console.warn(`[${getVersionInfo().env}] ${str}`, ...arg);
}
