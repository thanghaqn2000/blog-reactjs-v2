import ReactGA from 'react-ga4';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

let initialized = false;

export function isGoogleAnalyticsEnabled(): boolean {
  return Boolean(measurementId);
}

export function trackPageView(pathWithSearch: string): void {
  if (!measurementId) return;
  if (!initialized) {
    ReactGA.initialize(measurementId);
    initialized = true;
  }
  ReactGA.send({ hitType: 'pageview', page: pathWithSearch });
}
