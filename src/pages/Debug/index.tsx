import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { BigButton } from '@components/Button';
import ContentHeader from '@components/Content/ContentHeader';
import { CheckboxField } from '@components/Form/Checkbox';
import { ItemRow } from '@components/Structure';
import useLogger from '@hooks/useLogger';
import FEATURE_FLAGS, { FeatureFlags } from '@utils/FEATURE';

const DebugPage: React.FC = () => {
  const { t } = useTranslation();
  const { enabled: loggingEnabled, startLogging } = useLogger();

  return (
    <div>
      <Header>{t('debug.title')}</Header>
      <DebugContainer>
        <DebugColumn data-testid="debug_column">
          <ContentHeader data-testid="debug_content_header">{t('debug.feature_flags')}</ContentHeader>
          <BasicWrapper>
            {Object.keys(FEATURE_FLAGS).map((key) => (
              <FeatureFlagItem key={key} flag={key} active={FEATURE_FLAGS[key as keyof FeatureFlags]} />
            ))}
          </BasicWrapper>
        </DebugColumn>

        <DebugColumn data-testid="debug_column">
          <ContentHeader data-testid="debug_content_header">{t('debug.log_recording')}</ContentHeader>
          <div>
            <DebugSectionContent>{t('debug.logging_msg')}</DebugSectionContent>
            <ItemRow margin="md">
              {loggingEnabled ? (
                <DebugSectionContent>{t('debug.recording_logs')}...</DebugSectionContent>
              ) : (
                <RecordButton onClick={() => startLogging()}>{t('debug.start_recording')}</RecordButton>
              )}
            </ItemRow>
          </div>
        </DebugColumn>
      </DebugContainer>
    </div>
  );
};

//
// Utils
//

const FeatureFlagItem: React.FC<{ flag: string; active: boolean }> = ({ flag, active }) => {
  const { t } = useTranslation();

  return (
    <DebugSectionContainer>
      <DebugSectionTitle>
        <CheckboxField label={''} checked={active} disabled />
        {flag}
      </DebugSectionTitle>

      <DebugSectionContent>{t(getExplainText(flag))}</DebugSectionContent>
    </DebugSectionContainer>
  );
};

const KNOWN_FLAGS = Object.keys(FEATURE_FLAGS);

function getExplainText(flag: string): string {
  if (KNOWN_FLAGS.indexOf(flag) > -1) {
    return `debug.${flag}_msg`;
  }
  return 'debug.generic_msg';
}

//
// Style
//

const Header = styled.h3`
  margin: 1rem 0;
`;

const DebugContainer = styled.div`
  display: flex;
  flex-basis: 100%;
`;

const DebugColumn = styled.div`
  max-width: 25%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 3rem;
  padding-right: 1rem;
`;

const BasicWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const DebugSectionContainer = styled.div`
  margin-bottom: 1rem;
`;

const DebugSectionTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: var(--font-size-primary);
  line-height: 1.25rem;
`;

const DebugSectionContent = styled.div`
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--color-text-secondary);
`;

const RecordButton = styled(BigButton)`
  width: 100%;
  display: block;
`;

export default DebugPage;
