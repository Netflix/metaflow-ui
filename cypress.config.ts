import { defineConfig } from 'cypress';

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000/',
    supportFile: 'cypress/support/commands.js',
  },

  component: {
    setupNodeEvents(on, config) {},
    specPattern: 'src/**/*.test.cypress.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
});
