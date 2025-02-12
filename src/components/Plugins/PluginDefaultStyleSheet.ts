// eslint-disable-next-line
// @ts-ignore Load CSS as a string to be appended to injected plugin stylesheet.
// eslint-disable-next-line import/no-webpack-loader-syntax
import css from '!!css-loader?{"sourceMap":false,"exportType":"string"}!../../theme/theme.css';

const PLUGIN_STYLESHEET = `
  ${css}
  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
      'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--color-text-primary);
  }

  a {
    color: var(--color-text-highlight);
  }

  table {
    width: 100%;
  }

  table th {
    background: var(--color-bg-primary);
    color: var(--color-text-disabled);
    font-weight: 400;
    white-space: nowrap;
    padding: var(--spacing-3) var(--spacing-7);
    font-size: 0.875rem;
    text-align: left;
    border: 1px solid #fff;
  }

  table td {
    transition: background 0.15s;
    background: var(--color-bg-secondary);
    padding: var(--spacing-3) var(--spacing-7);
    font-size: 0.875rem;
    text-align: left;
    border: 1px solid #fff;
  }

  table td:hover {
    background: var(--color-bg-secondary-highlight);
  }

  button {
    display: flex;
    align-items: center;
    outline: 0;
    cursor: pointer;
    text-decoration: none;
    border-radius: 0.25rem;
    border: var(--border-primary-thin);
    min-height: 1.75rem;
    transition: background 0.15s;
  }

  button[disabled] {
    border-color: var(--color-bg-secondary);
    color: var(--color-text-light);
    cursor: not-allowed;
    background: var(--color-bg-secondary);
  }
`;

export default PLUGIN_STYLESHEET;
