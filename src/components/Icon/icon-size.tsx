export type SupportedSizes = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  hg: number;
};

export type IconSizes = keyof SupportedSizes;

export const sizeTable: SupportedSizes = {
  xs: 0.75,
  sm: 1,
  md: 1.5,
  lg: 2,
  hg: 2.5,
};
