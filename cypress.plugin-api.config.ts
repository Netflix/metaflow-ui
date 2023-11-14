import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    specPattern: 'plugin-api/**/*.test.cypress.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/commands.js',
  },
  screenshotOnRunFailure: false,
  video: false,
  viewportWidth: 700,
  viewportHeight: 700,
});
