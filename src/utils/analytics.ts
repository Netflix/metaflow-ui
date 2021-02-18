import ReactGA from 'react-ga';

//
// TODO: Make analytics more generic way so we are not tied to google
//

let trackingEnabled = false;
export function initializeGA(trackingId: string | null = null): void {
  if (trackingId) {
    trackingEnabled = true;
    ReactGA.initialize(trackingId);
  }
}

let prevUrl = '';
export function analyticsSendPageView(url: string): void {
  if (trackingEnabled) {
    if (prevUrl === url) {
      return;
    }
    prevUrl = url;
    ReactGA.pageview(url);
  }
}

export function analyticsSendException(description: string, fatal = false): void {
  if (trackingEnabled) {
    ReactGA.exception({ description, fatal });
  }
}
