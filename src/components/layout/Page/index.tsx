import React from 'react';
import styled from 'styled-components';
import { layout } from '../../../utils/theme';

interface PageProps {
  children: React.ReactNode;
}

export default function Page({ children }: PageProps) {
  return <Wrapper>{children}</Wrapper>;
}

const Wrapper = styled.div`
  padding: ${layout('appbarHeight')}rem ${layout('pagePaddingX')}rem 0;
`;
