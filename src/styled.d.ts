import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    layout: {
      /** This value is used for both appbar height and page top padding. (rem) */
      appbarHeight: number;
      /** Appbar logo image height in rem */
      appbarLogoHeight: number;
      /** This value is used for horizontal padding in pages and pagewide floating elements (rem) */
      pagePaddingX: number;
    };
    colors: {
      main: string;
      secondary: string;
      darkGray: string;
      lightGray: string;
    };
    statusColors: {
      success: string;
      primary: string;
      info: string;
      warning: string;
      danger: string;
      default: string;
    };
  }
}
