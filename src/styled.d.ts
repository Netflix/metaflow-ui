import 'styled-components';

type NotificationColorMap = { bg: string; text: string };

declare module 'styled-components' {
  export type ButtonColors = {
    bg: string;
    text: string;
    activeText: string;
    activeBg: string;
  };

  export interface DefaultTheme {
    layout: {
      /** Layout maximum width. (px) */
      maxWidth: number;
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
      [index: string];
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
        silver: string;
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
        mid: string;
        dark: string;
      };
      icon: {
        light: string;
        mid: string;
        dark: string;
      };
      button: {
        default: ButtonColors;
        text: ButtonColors;
        primaryText: ButtonColors;
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
