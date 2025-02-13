import styled, { css } from 'styled-components';

//
// Collection of structuring elements for page.
//

export const Page = styled.div`
  max-width: var(--layout-max-width);
  margin: 0 auto 0 auto;
  padding: 0 0 var(--layout-page-padding-y) var(--layout-page-padding-x);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Section = styled.section`
  padding: 0 var(--spacing-3);
  margin-bottom: var(--spacing-7);
`;

export const SectionHeader = styled.header<{ noPadding?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${(p) => (p.noPadding ? 0 : 'var(--spacing-3)')};
  margin: 0 calc(var(--spacing-3) * -1) var(--spacing-3);
  border-bottom: var(--border-primary-thin);
  color: var(--color-text-primary);
  height: 2rem;
`;

export const FixedContent = styled.div`
  height: calc(100vh - var(--layout-application-bar-height) + 2 rem);
  display: flex;
  flex-direction: column;
`;

function sizeToSpacingVar(size?: 'xs' | 'sm' | 'md' | 'lg' | 'hg') {
  switch (size) {
    case 'xs':
      return 'spacing-1';
    case 'sm':
      return 'spacing-3';
    case 'md':
      return 'spacing-7';
    case 'lg':
      return 'spacing-10';
    case 'hg':
      return 'spacing-12';
    default:
      return 'spacing-3';
  }
}

export const ItemRow = styled.div<{
  pad?: 'xs' | 'sm' | 'md' | 'lg' | 'hg';
  margin?: 'xs' | 'sm' | 'md' | 'lg' | 'hg';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
  noWidth?: boolean;
}>`
  display: flex;
  align-items: center;
  ${(p) => (!p.noWidth ? 'width: 100%;' : null)}

  ${(p) => (p.justify ? `justify-content: ${p.justify};` : '')}

  ${(p) =>
    p.margin &&
    css`
      margin: var(--${sizeToSpacingVar(p.margin)}) 0;
    `}

  > * {
    margin-right: var(--${(p) => sizeToSpacingVar(p.pad)});

    &:last-child {
      margin-right: 0;
    }
  }
`;
