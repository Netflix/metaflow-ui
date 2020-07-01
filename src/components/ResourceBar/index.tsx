import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

const ResourceBar: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

export default ResourceBar;

const Wrapper = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
`;
