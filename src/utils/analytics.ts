import ReactGA from 'react-ga';

const trackingId = process.env.REACT_APP_GA_TRACKING_ID;

export function initializeGA(): void {
  if (trackingId) {
    ReactGA.initialize(trackingId);
  }
}

let prevUrl = '';
export function analyticsSendPageView(url: string): void {
  if (trackingId) {
    if (prevUrl === url) {
      return;
    }
    prevUrl = url;
    ReactGA.pageview(url);
  }
}

export function analyticsSendException(description: string, fatal = false): void {
  if (trackingId) {
    ReactGA.exception({ description, fatal });
  }
}
