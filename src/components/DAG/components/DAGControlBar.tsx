import { TFunction } from 'i18next';
import React from 'react';
import styled from 'styled-components';
import Button from '@components/Button';
import Icon from '@components/Icon';
import { ItemRow } from '@components/Structure';

//
// DAG control bar
//

type DAGControlBarProps = {
  setFullscreen: (v: boolean) => void;
  isExpanded: boolean;
  setExpanded: (v: boolean) => void;
  t: TFunction;
};

const DAGControlBar: React.FC<DAGControlBarProps> = ({ setFullscreen, isExpanded, setExpanded, t }) => (
  <ItemRow pad="sm" justify="flex-end">
    <ControlBarItem>
      <Button
        onClick={() => setExpanded(!isExpanded)}
        withIcon
        active={isExpanded}
        data-testid="dag-control-expand-button"
      >
        <Icon name={isExpanded ? 'collapse' : 'expand'} />
        <span>{t(isExpanded ? 'run.collapse-dag' : 'run.expand-dag') as string}</span>
      </Button>
    </ControlBarItem>

    <ControlBarItem>
      <Button onClick={() => setFullscreen(true)} withIcon data-testid="dag-control-fullscreen-button">
        <Icon name="maximize" />
        <span>{t('run.show-fullscreen') as string}</span>
      </Button>
    </ControlBarItem>
  </ItemRow>
);

const ControlBarItem = styled.div`
  margin-left: 0.5rem;
`;

export default DAGControlBar;
