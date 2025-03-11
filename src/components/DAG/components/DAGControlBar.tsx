import { TFunction } from 'i18next';
import React from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import { ItemRow } from '@components/Structure';

//
// DAG control bar
//

type DAGControlBarProps = {
  setFullscreen: (v: boolean) => void;
  t: TFunction;
};

const DAGControlBar: React.FC<DAGControlBarProps> = ({ setFullscreen, t }) => (
  <ItemRow pad="sm" justify="flex-end">
    <Button onClick={() => setFullscreen(true)} withIcon data-testid="dag-control-fullscreen-button">
      <Icon name="maximize" />
      <span>{t('run.show-fullscreen') as string}</span>
    </Button>
  </ItemRow>
);

export default DAGControlBar;
