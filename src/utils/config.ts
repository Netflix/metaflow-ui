import { apiHttp } from '../constants';
import { initializeGA } from './analytics';
import { logWarning } from './errorlogger';

/**
 * Fetch configurations from server. For now it's just analytics tracking ID but this might get expanded
 * later with other information.
 */
export function fetchConfigurations(): void {
  fetch(apiHttp('/config'))
    .then((response) => (response.status === 200 ? response.json() : Promise.resolve(null)))
    .then((values: Record<string, string> | null) => {
      if (values) {
        if (values.GA_TRACKING_ID) {
          initializeGA(values.GA_TRACKING_ID);
        }
      } else {
        logWarning('Failed to fetch configurations');
      }
    })
    .catch(() => {
      logWarning('Failed to fetch configurations');
    });
}
