import { createGlobalStyle, css } from 'styled-components';
import { normalize } from 'polished';

// Introduce global css as `css` ttl for prettier formatting
const globalCSS = css`
  ${normalize}

  body, html, #root {
    margin: 0;
    padding: 0;
    min-width: 100%;
    min-height: 100vh;
  }

  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
      'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: ${(p) => p.theme.color.text.dark};
  }

  a {
    color: ${(p) => p.theme.color.text.blue};
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

  .muted {
    color: ${(p) => p.theme.color.text.light};
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: 600;
  }

  * {
    box-sizing: border-box;
  }

  .ReactVirtualized__List:focus {
    outline: none;
    border: none;
  }

  code {
    font-family: 'RobotoMono', monospace;
    font-size: 0.75rem;
  }
`;

export default createGlobalStyle`${globalCSS}`;
