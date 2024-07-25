import { DefaultTheme } from 'styled-components';
import { rgba } from 'polished';

const spacer = {
  xs: 0.25,
  sm: 0.5,
  md: 1,
  ml: 1.5,
  lg: 2,
  hg: 3,
};

const brandColor = {
  gray: '#333',
  blue: '#146EE6',
  teal: '#00BBCE',
};

const textColor = {
  dark: brandColor.gray,
  mid: '#666',
  light: '#767676',
  lightest: '#828282',
  white: '#fff',
  // this is a slightly darker tone of brand blue to meet a11y standards
  blue: '#0C66DE',
};

const bgColor = {
  white: '#fff',
  dark: '#767676',
  black: '#444',
  light: 'rgba(0,0,0,0.03)', // '#f6f6f6',
  blue: brandColor.blue,
  blueLight: '#e4f0ff',
  silver: '#E8EAED',
  teal: brandColor.teal,
  yellow: '#DBAD34',
  red: '#E6786C',
  green: '#4C9878',
  greenLight: '#BCE307',
  tooltip: rgba(51, 51, 51, 0.7),
};

const borderColor = {
  light: rgba(0, 0, 0, 0.125),
  normal: '#d0d0d0',
  mid: rgba(0, 0, 0, 0.2),
  dark: rgba(0, 0, 0, 0.35),
};

const connectionColor = {
  lightGreen: rgba(32, 175, 46, 0.2),
  green: ' #20AF2E',
  yellow: '#E5A90C',
  red: '#EB3428',
};

const border = {
  thinLight: `1px solid ${borderColor.light}`,
  thinNormal: `1px solid ${borderColor.normal}`,
  thinPrimary: `1px solid ${textColor.blue}`,
  thinMid: `1px solid ${borderColor.mid}`,
  thinDark: `1px solid ${borderColor.dark}`,
  mediumLight: `2px solid ${borderColor.light}`,
  mediumMid: `2px solid ${borderColor.mid}`,
  mediumDark: `2px solid ${borderColor.mid}`,
  mediumWhite: `2px solid ${bgColor.white}`,
};

const iconColor = {
  light: '#d9d9d9',
  mid: textColor.mid,
  dark: textColor.dark,
};

const buttonColor = {
  default: {
    text: textColor.mid,
    bg: 'transparent',
    border: border.thinNormal,
    activeText: textColor.dark,
    activeBg: bgColor.silver,
  },
  text: {
    text: textColor.dark,
    bg: 'transparent',
    activeText: textColor.dark,
    activeBg: bgColor.silver,
  },
  primaryText: {
    text: textColor.blue,
    bg: 'transparent',
    border: `1px solid ${textColor.blue}`,
    activeText: textColor.blue,
    activeBg: bgColor.silver,
  },
};

const defaultTheme: DefaultTheme = {
  layout: {
    maxWidth: 2560,
    appbarHeight: 7,
    appbarLogoHeight: 1.5,
    pagePaddingX: spacer.ml,
    pagePaddingY: spacer.lg,
    sidebarWidth: {
      md: 14,
      sm: 12,
    },
  },

  spacer,

  breakpoint: {
    sm: '1280px',
  },

  color: {
    text: textColor,
    bg: bgColor,
    border: borderColor,
    icon: iconColor,
    button: buttonColor,
    connection: connectionColor,
  },

  notification: {
    success: {
      bg: bgColor.green,
      fg: textColor.white,
      text: '#28a745', // TODO
    },
    info: {
      bg: bgColor.blue,
      fg: textColor.white,
      text: '#107177', // TODO
    },
    warning: {
      bg: bgColor.yellow,
      fg: textColor.white,
      text: bgColor.yellow, // TODO
    },
    danger: {
      bg: bgColor.red,
      fg: textColor.white,
      text: bgColor.red, // TODO
    },
    default: {
      bg: bgColor.silver,
      fg: textColor.mid,
      text: textColor.mid,
    },
  },
  spinner: {
    size: 20,
    sizes: {
      sm: {
        size: 20,
        borderWidth: 2,
      },
      md: {
        size: 32,
        borderWidth: 4,
      },
      lg: {
        size: 64,
        borderWidth: 6,
      },
    },
    color: brandColor.blue,
    borderWidth: 2,
  },

  border,
};

export default defaultTheme;
