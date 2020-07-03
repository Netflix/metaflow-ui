import { DefaultTheme } from 'styled-components';

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
  teal: brandColor.teal,
  yellow: '#E5A90C',
  red: '#EB3428',
  green: '#20AF2E',
};

const borderColor = {
  light: '#e9e9e9',
};

const defaultTheme: DefaultTheme = {
  layout: {
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
  },

  notification: {
    success: {
      bg: bgColor.white,
      text: '#28a745',// TODO
    },
    info: {
      bg: bgColor.white,
      text: '#107177',// TODO
    },
    warning: {
      bg: bgColor.white,
      text: '#107177',// TODO
    },
    danger: {
      bg: bgColor.white,
      text: '#107177',// TODO
    },
    default: {
      bg: bgColor.white,
      text: textColor.mid,
    },
  },
};

export default defaultTheme;
