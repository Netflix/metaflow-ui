import ReactGA from 'react-ga';

const trackingId = process.env.REACT_APP_GA_TRACKING_ID;

export function initializeGA(): void {
  if (trackingId) {
    ReactGA.initialize(trackingId);
  }
}

export function analyticsSendPageView(url: string): void {
  if (trackingId) {
    ReactGA.pageview(url);
  }
}

export function analyticsSendException(description: string, fatal = false): void {
  if (trackingId) {
    ReactGA.exception({ description, fatal });
  }
}
