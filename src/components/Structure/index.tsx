import styled from 'styled-components';
import { layout } from '../../utils/theme';

export const Layout = styled.div`
  display: flex;
`;

export const Sidebar = styled.div`
  flex: 0 0 300px;
`;

export const Content = styled.div`
  flex: 1;
  max-width: 100%;
`;

export const FixedContent = styled.div`
  height: calc(100vh - ${layout('appbarHeight')}rem);
  display: flex;
  flex-direction: column;
`;
