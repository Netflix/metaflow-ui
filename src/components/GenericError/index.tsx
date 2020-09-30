import React from 'react';
import styled from 'styled-components';
import { APIError } from '../../types';
import Icon, { IconKeys } from '../Icon';

type Props = {
  message: string;
  icon?: IconKeys | JSX.Element;
};

const GenericError: React.FC<Props> = ({ message, icon }) => (
  <GenericErrorContainer>
    {icon && typeof icon !== 'string' ? icon : <Icon name={icon || 'noData'} size="lg" />}
    <div>{message}</div>
  </GenericErrorContainer>
);

const GenericErrorContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;

  i {
    margin-bottom: 1rem;
  }
`;

export const APIErrorRendered: React.FC<{ error: APIError }> = ({ error }) => {
  console.log(error);
  // Figure out message, we might have translated message for some error IDs
  // Figure out icon

  return <GenericError message="apierror" icon={<div />} />;
};

export default GenericError;
