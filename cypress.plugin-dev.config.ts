import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    specPattern: 'plugin-api/dev/*.plugin-dev.{js,ts,jsx,tsx}',
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
