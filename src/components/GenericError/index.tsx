import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { APIError } from '../../types';
import { getVersionInfo } from '../../VERSION';
import Collapsable from '../Collapsable';
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
  customNotFound?: React.ReactNode; // error rendering streamlined for now and this is not needed
};

export const APIErrorRenderer: React.FC<APIErrorRendererProps> = ({ error, message, icon }) => {
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

      {error && <APIErrorDetails error={error} noIcon={icon === false} t={t} />}
    </APIErrorContainer>
  );
};

export const APIErrorDetails: React.FC<{ error: APIError; noIcon: boolean; t: TFunction }> = ({ error, noIcon, t }) => {
  const version = getVersionInfo();

  // TODO: update these later on
  // noIcon option can probably be cleaned away later on
  // shouldn't actually ever happen
  const versionsTable = noIcon
    ? {
        ID: `${error.id}`,
        'Application version': `${version.release_version} - ${version.commit} - ${version.env}`,
        'Service version': `${version.service_version}`,
      }
    : {
        Status: `${error.status}`,
        Title: `${error.title}`,
        Detail: `${error.detail || '-'}`,
        ID: `${error.id}`,
        'Application version': `${version.release_version} - ${version.commit} - ${version.env}`,
        'Service version': `${version.service_version}`,
      };

  // TODO: update these later on
  // these should come with the error object in the future
  // will be re-enabled when error links data is updated
  /*const linksTable = {
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
  }; */

  return (
    <DetailContainer className={!noIcon ? 'noIcon' : ''} data-testid="error-details">
      {noIcon && (
        <DetailsTitle>
          <span className="statusCode" data-testid="error-details-title">
            {error.status}
          </span>
          <p className="statusTitle">{error.title}</p>
        </DetailsTitle>
      )}
      <Collapsable title={t('error.error-details')}>
        {error.traceback && (
          <>
            <DetailsHeader>{t('error.stack-trace')}</DetailsHeader>
            <DetailsLog data-testid="error-details-logs">{error.traceback}</DetailsLog>
          </>
        )}
        <TitledRow title={t('error.details')} type="table" content={versionsTable} />
        {/* will be re-enabled when error links data is updated */}
        {/* <TitledRow title={t('task.links')} type="table" content={linksTable} /> */}
        {noIcon && error.detail && (
          <DetailsSubTitle data-testid="error-details-subtitle">{error.detail}</DetailsSubTitle>
        )}
      </Collapsable>
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

  &.noIcon {
    padding: 0.5rem 0 0;
  }
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

export default GenericError;
