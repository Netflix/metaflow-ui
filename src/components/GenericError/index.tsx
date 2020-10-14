import React, { useState } from 'react';
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
  'dag-unsupported-flow-language',
  'not-found',
  'log-error-s3',
  'log-error',
];

type APIErrorRendererProps = {
  error: APIError | null;
  message?: string;
  icon?: IconKeys | JSX.Element;
  customNotFound?: React.ReactNode;
};

export const APIErrorRenderer: React.FC<APIErrorRendererProps> = ({ error, message, customNotFound, icon }) => {
  const { t } = useTranslation();
  let msg = t('error.generic-error');

  if (error && knownErrorIds.indexOf(error.id) > -1) {
    msg = t(`error.${error.id}`);
  }

  msg = message || msg;

  return (
    <div>
      <GenericError message={msg} icon={icon} />
      {error && error.status !== 404 && <APIErrorDetails error={error} />}
      {error && error.status === 404 && customNotFound && <div>{customNotFound}</div>}
    </div>
  );
};

export const APIErrorDetails: React.FC<{ error: APIError }> = ({ error }) => {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <DetailContainer>
        <DetailsOpenLink onClick={() => setOpen(true)}>Show error details</DetailsOpenLink>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      <DetailsTitle>
        <span>
          {error.status} - {error.title} <span style={{ fontSize: '16px' }}>({error.id})</span>
        </span>
        <DetailsCloseButton onClick={() => setOpen(false)}>
          <Icon name="times" size="lg" />
        </DetailsCloseButton>
      </DetailsTitle>
      {error.detail && <DetailsSubTitle>{error.detail}</DetailsSubTitle>}

      {error.traceback && <DetailsLog>{error.traceback}</DetailsLog>}
    </DetailContainer>
  );
};

const DetailContainer = styled.div`
  padding: 2rem;
`;

const DetailsOpenLink = styled.div`
  color: ${(p) => p.theme.color.text.blue};
  text-align: center;
  cursor: pointer;
`;

const DetailsTitle = styled.div`
  font-size: 30px;
  padding: 0.5rem 0;
  display: flex;
  justify-content: space-between;
`;

const DetailsCloseButton = styled.div`
  cursor: pointer;
`;

const DetailsSubTitle = styled.div`
  font-size: 18px;
  padding: 0.5rem 0;
`;

const DetailsLog = styled.div`
  margin-top: 0.5rem;
  font-size: 14px;
  line-height: 1.2rem;
  background: #fafafa;
  color: #6d6d6d;
  white-space: pre;
  border: ${(p) => p.theme.border.thinLight};
  border-radius: 3px;
  padding: 1rem;
  overflow: hidden;
  font-family: monospace;
`;

export const DefaultAdditionalErrorInfo = (str: string): JSX.Element => (
  <div style={{ textAlign: 'center', margin: '1rem 0' }}>{str}</div>
);

export default GenericError;
