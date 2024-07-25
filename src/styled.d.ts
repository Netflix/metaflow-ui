import 'styled-components';

type NotificationColorMap = { bg: string; fg: string; text: string };

declare module 'styled-components' {
  export type ButtonColors = {
    bg: string;
    text: string;
    activeText: string;
    activeBg: string;
    border?: string;
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
      sidebarWidth: {
        sm: number;
        md: number;
      };
    };

    breakpoint: {
      sm: string;
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
        white: string;
        light: string;
        dark: string;
        black: string;
        blue: string;
        blueLight: string;
        silver: string;
        teal: string;
        yellow: string;
        red: string;
        green: string;
        greenLight: string;
        tooltip: string;
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
      connection: {
        green: string;
        lightGreen: string;
        yellow: string;
        red: string;
      };
    };

    notification: {
      success: NotificationColorMap;
      info: NotificationColorMap;
      warning: NotificationColorMap;
      danger: NotificationColorMap;
      default: NotificationColorMap;
    };

    spinner: {
      sizes: {
        sm: {
          size: number;
          borderWidth: number;
        };
        md: {
          size: number;
          borderWidth: number;
        };
        lg: {
          size: number;
          borderWidth: number;
        };
      };
      size: number; // Spinner size (width & height) (px)
      color: string; // Border color
      borderWidth: number; // Border width (px)
    };

    border: {
      thinLight: string;
      thinNormal: string;
      thinPrimary: string;
      thinMid: string;
      thinDark: string;
      mediumLight: string;
      mediumMid: string;
      mediumDark: string;
      mediumWhite: string;
    };
  }
}
