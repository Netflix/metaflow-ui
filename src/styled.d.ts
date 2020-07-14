import 'styled-components';

type NotificationColorMap = { bg: string; text: string };

declare module 'styled-components' {
  export interface DefaultTheme {
    layout: {
      /** This value is used for both appbar height and page top padding. (rem) */
      appbarHeight: number;
      /** Appbar logo image height in rem */
      appbarLogoHeight: number;
      /** This value is used for horizontal padding in pages and pagewide floating elements (rem) */
      pagePaddingX: number;
      pagePaddingY: number;
      sidebarWidth: number;
    };

    spacer: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      hg: number;
    };

    color: {
      bg: {
        [index: string];
        white: string;
        light: string;
        dark: string;
        blue: string;
        blueLight: string;
        blueGray: string;
        teal: string;
        yellow: string;
        red: string;
        green: string;
      };
      text: {
        white: string;
        lightest: string;
        light: string;
        mid: string;
        dark: string;
        blue: string;
      };
      border: {
        light: string;
        normal: string;
      };
      icon: {
        light: string;
        mid: string;
        dark: string;
      };
    };

    notification: {
      [index: string];
      success: NotificationColorMap;
      info: NotificationColorMap;
      warning: NotificationColorMap;
      danger: NotificationColorMap;
      default: NotificationColorMap;
    };
  }
}
