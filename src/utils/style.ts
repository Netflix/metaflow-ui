import { DefaultTheme } from 'styled-components';

export function colorByStatus(theme: DefaultTheme, status: string): string {
  switch (status) {
    case 'completed':
      return theme.color.bg.green;
    case 'failed':
      return theme.color.bg.red;
    case 'running':
      return theme.color.bg.yellow;
    default:
      return theme.color.bg.dark;
  }
}
