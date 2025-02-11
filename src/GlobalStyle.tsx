import { createGlobalStyle, css } from 'styled-components';
import { normalize } from 'polished';
import './theme/theme.css';

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
    font-family: var(--font-family-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--color-text-primary);
  }

  a {
    color: var(--color-text-highlight);
  }

  dt {
    font-weight: var(--font-weight-semibold);
  }

  dd {
    margin-inline-start: 0;
  }

  .muted {
    color: var(--color-text-light);
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: var(--font-weight-semibold);
  }

  * {
    box-sizing: border-box;
  }

  .ReactVirtualized__List:focus {
    outline: none;
    border: none;
  }

  code {
    font-family: var(--font-family-code);
    font-size: var(--font-size-4);
  }
`;

export const GlobalTheme = createGlobalStyle``;

export default createGlobalStyle`${globalCSS}`;
