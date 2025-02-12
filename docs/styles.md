# Styles

Styles are implemented with [styled-components](https://styled-components.com/).

## Theme

Theming is implemented with CSS variables. You can implement your own theme by providing your own theme css file to index.html or editing existing theme and rebuilding the application.

```javascript
import styled from 'styled-components';

const StyledElement = styled.div`
  background: var(--color-bg-primary);
`;
```

- [Theme file](../src/theme/theme.css)

## Notes

- Use REM instead of PX where ever possible. This will make sure that styles still work if custom browser settings are set by the user.
