import defaultTheme from '../../theme';

const PLUGIN_STYLESHEET = `
  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
      'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: ${defaultTheme.color.text.dark};
  }

  a {
    color: ${defaultTheme.color.text.blue};
  }

  table {
    width: 100%;
  }

  table th {
    background: ${defaultTheme.color.bg.white};
    color: ${defaultTheme.color.text.light};
    font-weight: 400;
    white-space: nowrap;
    padding: ${defaultTheme.spacer.sm}rem ${defaultTheme.spacer.md}rem;
    font-size: 0.875rem;
    text-align: left;
    border: 1px solid #fff;
  }

  table td {
    transition: background 0.15s;
    background: ${defaultTheme.color.bg.light};
    padding: ${defaultTheme.spacer.sm}rem ${defaultTheme.spacer.md}rem;
    font-size: 0.875rem;
    text-align: left;
    border: 1px solid #fff;
  }

  table td:hover {
    background: ${defaultTheme.color.bg.blueLight};
  }

  button {
    display: flex;
    align-items: center;
    outline: 0;
    cursor: pointer;
    text-decoration: none;
    border-radius: 0.25rem;
    border: ${defaultTheme.border.thinNormal};
    min-height: 1.75rem;
    transition: background 0.15s;
  }

  button[disabled] {
    border-color: ${defaultTheme.color.bg.light};
    color: ${defaultTheme.color.text.light};
    cursor: not-allowed;
    background: ${defaultTheme.color.bg.light};
  }
`;

export default PLUGIN_STYLESHEET;
