import { TFunction } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { APIError } from '../../types';
import { getVersionInfo } from '../../VERSION';
import Icon, { IconKeys } from '../Icon';
import TitledRow from '../TitledRow';

type Props = {
  message: string;
  icon?: IconKeys | JSX.Element;
  noIcon?: boolean;
  'data-testid'?: string;
};

const GenericError: React.FC<Props> = ({ message, icon, noIcon, ...rest }) => (
  <GenericErrorContainer data-testid="generic-error" {...rest}>
    {!noIcon && (icon && typeof icon !== 'string' ? icon : <Icon name={icon || 'noData'} size="lg" />)}
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
  icon?: IconKeys | JSX.Element | false;
  customNotFound?: React.ReactNode;
};

export const APIErrorRenderer: React.FC<APIErrorRendererProps> = ({ error, message, customNotFound, icon }) => {
  const { t } = useTranslation();
  let msg = t('error.generic-error');

  if (error && knownErrorIds.indexOf(error.id) > -1) {
    msg = t(`error.${error.id}`);
  }

  msg = message || msg;

  const iconProps = icon === false ? { noIcon: true } : { icon: icon };

  return (
    <APIErrorContainer>
      <GenericError message={msg} {...iconProps} />
      {error && error.status !== 404 && <APIErrorDetails error={error} t={t} />}
      {error && error.status === 404 && customNotFound && <div>{customNotFound}</div>}
    </APIErrorContainer>
  );
};

export const APIErrorDetails: React.FC<{ error: APIError; t: TFunction }> = ({ error, t }) => {
  const [open, setOpen] = useState(false);
  const version = getVersionInfo();
  // TODO make these dynamic
  const versionsTable = {
    ID: `${error.id}`,
    'Application version': `${version.release_version} - ${version.commit} - ${version.env}`,
    'Service version': `${version.service_version}`,
  };
  // TODO make these dynamic
  const linksTable = {
    Documentation: (
      <a href="https://docs.metaflow.org/" target="_blank" rel="noopener noreferrer">
        https://docs.metaflow.org/
      </a>
    ),
    Help: (
      <a href="https://gitter.im/metaflow_org/community?source=orgpage" target="_blank" rel="noopener noreferrer">
        https://gitter.im/metaflow_org/community?source=orgpage
      </a>
    ),
  };

  if (!open) {
    return (
      <DetailContainer data-testid="error-details">
        <DetailsTitle>
          <span className="statusCode" data-testid="error-details-title">
            {error.status}
          </span>
          <p className="statusTitle">{error.title}</p>
        </DetailsTitle>
        {error.detail && <DetailsSubTitle data-testid="error-details-subtitle">{error.detail}</DetailsSubTitle>}
        <DetailsOpenLink onClick={() => setOpen(true)} data-testid="error-details-seemore">
          {t('error.show-more-details')}
          <Icon name="arrowDown" rotate={open ? 180 : 0} padLeft />
        </DetailsOpenLink>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer data-testid="error-details">
      <DetailsTitle className={open && 'open'}>
        <span className="statusCode" data-testid="error-details-title">
          {error.status}
        </span>
        <p className="statusTitle">{error.title}</p>
      </DetailsTitle>

      {error.detail && <DetailsSubTitle data-testid="error-details-subtitle">{error.detail}</DetailsSubTitle>}

      <TitledRow title={t('error.error-details')} type="table" content={versionsTable} />
      <TitledRow title={t('task.links')} type="table" content={linksTable} />

      {error.traceback && (
        <>
          <DetailsHeader>{t('error.stack-trace')}</DetailsHeader>
          <DetailsLog data-testid="error-details-logs">{error.traceback}</DetailsLog>
        </>
      )}

      <DetailsOpenLink onClick={() => setOpen(false)} data-testid="error-details-seemore">
        {t('error.hide-more-details')}
        <Icon name="arrowDown" rotate={open ? 180 : 0} padLeft />
      </DetailsOpenLink>
    </DetailContainer>
  );
};

const APIErrorContainer = styled.div`
  width: 100%;
  margin: 1rem 0;
`;

const DetailContainer = styled.div`
  padding: 2rem 0 0;
  max-width: 632px;
  margin: 0 auto;
`;

const DetailsOpenLink = styled.div`
  color: ${(p) => p.theme.color.text.blue};
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.5rem;
  text-align: right;
`;

const DetailsTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem 0;

  .statusCode {
    font-size: 4rem;
  }
  .statusTitle {
    font-size: 2rem;
    margin: 2rem 0 0;
  }
  .explanation {
    font-size: 1rem;
    margin: 0 0 0.5rem;
  }
`;

const DetailsSubTitle = styled.div`
  font-size: 1rem;
  padding: 0 0 0.5rem;
  text-align: center;
`;

const DetailsHeader = styled.div`
  font-weight: 500;
  margin: 1rem 0 0.5rem;
`;

const DetailsLog = styled.div`
  background: ${(p) => p.theme.color.bg.light};
  border: ${(p) => p.theme.border.thinNormal};
  border-radius: 3px;
  color: ${(p) => p.theme.color.text.light};
  font-family: monospace;
  font-size: 14px;
  line-height: 1.2rem;
  margin: 0.5rem 0;
  max-height: 400px;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 1rem;
  white-space: break-spaces;
  word-break: break-all;
`;

export const DefaultAdditionalErrorInfo = (str: string): JSX.Element => (
  <div style={{ textAlign: 'center', margin: '1rem 0' }}>{str}</div>
);

export default GenericError;
