import { DefaultTheme } from 'styled-components';
import { rgba } from 'polished';

const spacer = {
  xs: 0.25,
  sm: 0.5,
  md: 1,
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
  light: '#f6f6f6',
  blue: brandColor.blue,
  blueLight: '#e4f0ff',
  silver: '#E8EAED',
  teal: brandColor.teal,
  yellow: '#E5A90C',
  red: '#EB3428',
  green: '#20AF2E',
};

const borderColor = {
  light: rgba(0, 0, 0, 0.125),
  mid: rgba(0, 0, 0, 0.2),
  dark: rgba(0, 0, 0, 0.35),
};

const iconColor = {
  light: '#d9d9d9',
  mid: textColor.mid,
  dark: textColor.dark,
};

const buttonColor = {
  default: {
    text: textColor.mid,
    bg: bgColor.light,
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
    activeText: textColor.dark,
    activeBg: bgColor.silver,
  },
};

const defaultTheme: DefaultTheme = {
  layout: {
    maxWidth: 2560,
    appbarHeight: 7,
    appbarLogoHeight: 1.5,
    pagePaddingX: spacer.hg,
    pagePaddingY: spacer.lg,
    sidebarWidth: 14,
  },

  spacer,

  color: {
    text: textColor,
    bg: bgColor,
    border: borderColor,
    icon: iconColor,
    button: buttonColor,
  },

  notification: {
    success: {
      bg: bgColor.white,
      text: '#28a745', // TODO
    },
    info: {
      bg: bgColor.white,
      text: '#107177', // TODO
    },
    warning: {
      bg: bgColor.white,
      text: bgColor.yellow, // TODO
    },
    danger: {
      bg: bgColor.white,
      text: bgColor.red, // TODO
    },
    default: {
      bg: bgColor.white,
      text: textColor.mid,
    },
  },
};

export default defaultTheme;
