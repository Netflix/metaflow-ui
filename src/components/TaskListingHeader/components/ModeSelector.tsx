import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraphMode } from '../../Timeline/useGraph';
import { TabsHeading, TabsHeadingItem } from '../../Tabs';

//
// Typedef
//
type Props = {
  activeMode: GraphMode;
  select: (mode: GraphMode) => void;
};

//
// Component
//

const ModeSelector: React.FC<Props> = ({ activeMode, select }) => {
  const { t } = useTranslation();

  return (
    <TabsHeading>
      <TabsHeadingItem active={activeMode === 'overview'} onClick={() => select('overview')}>
        {t('run.overview')}
      </TabsHeadingItem>
      <TabsHeadingItem active={activeMode === 'monitoring'} onClick={() => select('monitoring')}>
        {t('run.monitoring')}
      </TabsHeadingItem>
      <TabsHeadingItem active={activeMode === 'error-tracker'} onClick={() => select('error-tracker')}>
        {t('run.error-tracker')}
      </TabsHeadingItem>
      <TabsHeadingItem active={activeMode === 'custom'} onClick={() => select('custom')}>
        {t('run.custom')}
      </TabsHeadingItem>
    </TabsHeading>
  );
};

export default ModeSelector;
