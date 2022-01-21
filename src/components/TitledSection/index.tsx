import React from 'react';
import styled from 'styled-components';

type HeaderProps = {
  label?: React.ReactNode | string;
  actionbar?: React.ReactNode;
};

export const TitledSectionHeader: React.FC<HeaderProps> = ({ label, actionbar }) => (
  <TitledSectionHeaderContainer>
    <h3>{label}</h3>
    <TitledSectionActions>{actionbar && actionbar}</TitledSectionActions>
  </TitledSectionHeaderContainer>
);

export const TitledSectionHeaderContainer = styled.div`
  border-bottom: ${(p) => p.theme.border.thinNormal};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 1.125rem;
    margin: 0.75rem 0;
  }
`;

export const TitledSectionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
