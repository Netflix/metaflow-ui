import { defineConfig } from 'cypress';
import importPaths from './import-alias.config';

export default defineConfig({
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
      webpackConfig: (config) => ({
        ...config,
        resolve: {
          alias: {
            ...importPaths,
          },
        },
      }),
    },
    specPattern: '**/*.test.cypress.{js,ts,jsx,tsx}',
    excludeSpecPattern: '**/*.plugin-dev.*',
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
