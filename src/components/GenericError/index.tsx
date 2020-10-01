import React from 'react';
import { useTranslation } from 'react-i18next';
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

export const knownErrorIds = [
  's3-access-denied',
  's3-not-found',
  's3-bad-url',
  's3-missing-credentials',
  's3-generic-error',
  'dag-processing-error',
];

export const APIErrorRendered: React.FC<{ error: APIError }> = ({ error }) => {
  const { t } = useTranslation();
  let message = t('error.generic-error');

  if (knownErrorIds.indexOf(error.id) > -1) {
    message = t(`error.${error.id}`);
  }

  return <GenericError message={message} />;
};

export default GenericError;
