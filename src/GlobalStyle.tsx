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
    background: var(--layout-color-bg);
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
    display: block;
    background: var(--code-bg);
    color: var(--code-text-color);
    font-size: var(--code-font-size);
    font-family: var(--code-font-family);
    font-weight: var(--code-font-weight);
    padding: var(--code-padding);
    border-bottom: var(--code-border-bottom);
    border-top: var(--code-border-top);
    border-left: var(--code-border-left);
    border-right: var(--code-border-right);
    border-radius: var(--code-border-radius);
  }
`;

export default createGlobalStyle`${globalCSS}`;
