# Styles

Styles are implemented with [styled-components](https://styled-components.com/).

## Theme

Theme includes mostly colors and some component specific styles. Colors should mostly be used from the theme eg.

```javascript
import styled from 'styled-components';

const StyledElement = styled.div`
  background: ${(props) => props.theme.color.bg.dark};
`;
```

- [Theme file](../src/theme/index.tsx)
- [Theme type definition](../src/styled.d.ts)

## Notes

- Use REM instead of PX where ever possible. This will make sure that styles still works if custom browser settings are in user.
