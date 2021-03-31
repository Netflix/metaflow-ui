//
// This file handles versions of UI and BACKEND it's connected to. We show version info with error messages that happen.
// Version is also available from browser console in window.APPLICATION_VERSION.
//

import { apiHttp } from '../constants';

declare global {
  interface Window {
    APPLICATION_VERSION: { commit: string; release_version: string; env: string };
  }
}

export type VersionInfo = {
  commit: string;
  release_version: string;
  service_version: string;
  env: 'development' | 'production' | 'test';
};

const VERSION_INFO: VersionInfo = {
  commit: process.env.REACT_APP_COMMIT_HASH || '',
  release_version: process.env.REACT_APP_RELEASE_VERSION || '',
  service_version: '',
  env: process.env.NODE_ENV,
};

export function setServiceVersion(serviceVersion: string): void {
  VERSION_INFO.service_version = serviceVersion;
}

export function getVersionInfo(): VersionInfo {
  return VERSION_INFO;
}

/**
 * Fetch version of backend service.
 */
export function fetchServiceVersion(): void {
  fetch(apiHttp('/version'))
    .then((response) => (response.status === 200 ? response.text() : Promise.resolve('')))
    .then((value) => {
      if (value) {
        setServiceVersion(value);
      }
    });
}

window.APPLICATION_VERSION = VERSION_INFO;

export default VERSION_INFO;
