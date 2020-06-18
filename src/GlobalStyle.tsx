import { createGlobalStyle, css } from 'styled-components';
import { normalize } from 'polished';

// Introduce global css as `css` ttl for prettier formatting
const globalCSS = css`
  ${normalize}

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
      'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  dt {
    font-weight: 600;
  }

  dd {
    margin-inline-start: 0;
  }

  * {
    box-sizing: border-box;
  }
`;

export default createGlobalStyle`${globalCSS}`;
