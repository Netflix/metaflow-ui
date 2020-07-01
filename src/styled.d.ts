import 'styled-components';

declare module 'styled-components' {
  interface Index<T> {
    [index: string];
    T;
  }

  export type DefaultTheme = Index<
    string,
    {
      layout: Index<{
        /** This value is used for both appbar height and page top padding. (rem) */
        appbarHeight: number;
        /** Appbar logo image height in rem */
        appbarLogoHeight: number;
        /** This value is used for horizontal padding in pages and pagewide floating elements (rem) */
        pagePaddingX: number;
        pagePaddingY: number;
        sidebarWidth: number;
      }>;

      spacer: Index<{
        xs: number;
        sm: number;
        md: number;
        lg: number;
        hg: number;
      }>;

      color: Index<{
        bg: Index<{
          white: string;
          light: string;
          dark: string;
          blue: string;
          blueLight: string;
          teal: string;
          yellow: string;
          red: string;
          green: string;
        }>;
        text: Index<{
          white: string;
          lightest: string;
          light: string;
          mid: string;
          dark: string;
          blue: string;
        }>;
        border: Index<{
          light: string;
        }>;
      }>;

      notification: Index<{
        success: { bg: string; text: string };
        info: { bg: string; text: string };
        warning: { bg: string; text: string };
        danger: { bg: string; text: string };
        default: { bg: string; text: string };
      }>;
    }
  >;
}
