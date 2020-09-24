import styled, { css } from 'styled-components';

export const Page = styled.div`
  max-width: ${(p) => p.theme.layout.maxWidth}px;
  margin: 0 auto 0 auto;
  padding: 0 ${(p) => p.theme.layout.pagePaddingX}rem ${(p) => p.theme.layout.pagePaddingY}rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &:before {
    display: block;
    content: '';
    height: ${(p) => p.theme.layout.appbarHeight}rem;
  }
`;

export const Section = styled.section`
  padding: 0 ${(p) => p.theme.spacer.sm}rem;
  margin-bottom: ${(p) => p.theme.spacer.md}rem;
`;

export const SectionHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${(p) => p.theme.spacer.sm}rem;
  ${(p) => p.theme.spacer.sm}rem;
  margin: 0 -${(p) => p.theme.spacer.sm}rem ${(p) => p.theme.spacer.sm}rem;
  border-bottom: 1px solid ${(p) => p.theme.color.border.light};
  color: ${(p) => p.theme.color.text.light};
`;

type FlexAlignments = {
  left: string;
  center: string;
  right: string;
};

const alignmentToFlex: FlexAlignments = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export const SectionHeaderContent = styled.div<{ align: keyof FlexAlignments }>`
  justify-content: ${(p) => alignmentToFlex[p.align]};
  align-items: center;
`;

export const FixedContent = styled.div`
  height: calc(100vh - ${(p) => p.theme.layout.appbarHeight + 2}rem);
  display: flex;
  flex-direction: column;
`;

export const ItemRow = styled.div<{
  pad?: 'xs' | 'sm' | 'md' | 'lg' | 'hg';
  margin?: 'xs' | 'sm' | 'md' | 'lg' | 'hg';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
}>`
  display: flex;
  align-items: center;

  ${(p) => (p.justify ? `justify-content: ${p.justify};` : '')}

  ${(p) =>
    p.margin &&
    css`
      margin: ${p.theme.spacer[p.margin || 'sm']}rem 0;
    `}

  > * {
    margin-right: ${(p) => p.theme.spacer[p.pad || 'sm']}rem;

    &:last-child {
      margin-right: 0;
    }
  }
`;
