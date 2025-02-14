import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Icon from '../../../components/Icon';
import { isVersionEqualOrHigher } from '../../../components/Plugins/PluginManager';
import { Run } from '../../../types';

//
// Typedef
//

type Props = {
  run: Run;
  usesLocalDataStore: boolean;
};

//
// Component
//

const RunWarning: React.FC<Props> = ({ run, usesLocalDataStore }) => {
  const errors = [];

  if (!hasVersionTag(run)) {
    errors.push('no-version-tag');
  }

  if (isUsingTooOldVersion(run)) {
    errors.push('old-client');
  }

  if (usesLocalDataStore) {
    errors.push('local-datastorage');
  }

  return errors.length > 0 ? (
    <Container>
      <Icon name="warningThick" customSize="1.4rem" />
      <div>
        {errors.map((error) => {
          if (error === 'no-version-tag') {
            return <WarningNoVersionInfo key={error} />;
          } else if (error === 'old-client') {
            return <WarningAboutOldClient key={error} />;
          } else if (error === 'local-datastorage') {
            return <WarningLocalDatastore key={error} />;
          }
          console.warn('Unknown error code appeared: ', error);
          return '';
        })}
      </div>
    </Container>
  ) : null;
};

//
// Warnings
//

const WarningNoVersionInfo = () => {
  const { t } = useTranslation();
  return <div>{t('error.no-run-version-info')}</div>;
};

const WarningAboutOldClient = () => {
  const { t } = useTranslation();
  return <div>{t('error.old-metaflow-client-warning')}</div>;
};

const WarningLocalDatastore = () => {
  const { t } = useTranslation();
  return <div>{t('error.local-datastore-warning')}</div>;
};

//
// Helpers
//

function isUsingTooOldVersion(run: Run): boolean {
  const versiontag = run.system_tags.find((tag) => tag.startsWith('metaflow_version'));

  // If there is no version tag we dont want to show old version warning
  if (!versiontag) {
    return false;
  }

  const versionnumber = versiontag.split(':')[1];
  if (versionnumber.startsWith('1')) {
    return !isVersionEqualOrHigher(versionnumber, '1.22.5');
  }

  if (versionnumber.startsWith('2')) {
    return !isVersionEqualOrHigher(versionnumber, '2.4.1');
  }

  return false;
}

function hasVersionTag(run: Run): boolean {
  return !!run.system_tags.find((tag) => tag.startsWith('metaflow_version'));
}

//
// Style
//

const Container = styled.div`
  background: var(--color-warning);
  padding: 0.5rem 1.5rem;
  margin: 0 -1.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  font-weight: 500;

  i {
    margin-right: 0.5rem;
  }

  a {
    color: var(--color-text-primary);
  }
`;

export default RunWarning;
