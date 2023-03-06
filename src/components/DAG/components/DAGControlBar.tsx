import React from 'react';
import { TFunction } from 'i18next';
import Button from '../../Button';
import Icon from '../../Icon';
import { ItemRow } from '../../Structure';

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
