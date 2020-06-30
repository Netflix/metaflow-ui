import styled from 'styled-components';

export const Page = styled.div`
  margin-top: ${(p) => p.theme.layout.appbarHeight}rem;
  padding: 0 ${(p) => p.theme.layout.pagePaddingX}rem ${(p) => p.theme.layout.pagePaddingY}rem;
`;

export const Layout = styled.main`
  display: flex;
  justify-content: space-between;
`;

export const Sidebar = styled.div`
  flex: 0 0 ${(p) => p.theme.layout.sidebarWidth}rem;
  margin-right: ${(p) => p.theme.spacer.hg}rem;
`;

export const Content = styled.div`
  flex: 1;
  max-width: 100%;
`;

export const Section = styled.section`
  padding: 0 ${(p) => p.theme.spacer.sm}rem;
  margin-bottom: ${(p) => p.theme.spacer.md}rem;
`;

export const SectionHeader = styled.header`
  display: flex;
  align-items: center; 
  justify-content: space-between;
  padding: ${(p) => p.theme.spacer.sm}rem; ${(p) => p.theme.spacer.sm}rem;
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
  justify-content: ${p => alignmentToFlex[p.align]};
  align-items: center;
`;
