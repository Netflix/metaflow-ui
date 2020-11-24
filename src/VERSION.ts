declare global {
  interface Window {
    APPLICATION_VERSION: { commit: string; release_version: string; env: string };
  }
}

const VERSION_INFO = {
  commit: process.env.REACT_APP_COMMIT_HASH || '',
  release_version: process.env.REACT_APP_RELEASE_VERSION || '',
  env: process.env.NODE_ENV,
};

window.APPLICATION_VERSION = VERSION_INFO;

export default VERSION_INFO;
