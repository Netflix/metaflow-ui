import React from 'react';
import styled from 'styled-components';
import TaskListLabel from '../../../components/Timeline/TaskListLabel';
import { useTranslation } from 'react-i18next';
import { Row } from '../../../components/Timeline/VirtualizedTimeline';
import { getRowStatus } from '../../../components/Timeline/TimelineRow';

type Props = {
  index: number;
  style: React.CSSProperties;
  item: Row;
  active: boolean;
  grouped: boolean;
  isOpen?: boolean;
  duration: number | null;
  toggle?: () => void;
  paramsString?: string;
};

const TaskListRow: React.FC<Props> = ({
  index,
  style,
  item,
  toggle = () => null,
  grouped,
  duration,
  isOpen = true,
  active,
  paramsString,
}) => {
  const { t } = useTranslation();
  return (
    <TaskListRowContainer key={index} style={style} active={active}>
      {item.type === 'step' ? (
        item.data ? (
          <TaskListLabel
            type="step"
            item={item.data}
            duration={duration}
            toggle={toggle}
            open={isOpen}
            grouped={grouped}
            status={getRowStatus(item)}
            t={t}
          />
        ) : null
      ) : (
        <TaskListLabel
          type="task"
          item={item.data[item.data.length - 1]}
          open={isOpen}
          duration={duration}
          grouped={grouped}
          status={getRowStatus({ type: 'task', data: item.data[item.data.length - 1] })}
          t={t}
          paramsString={paramsString}
        />
      )}
    </TaskListRowContainer>
  );
};

const TaskListRowContainer = styled.div<{ active: boolean }>`
  border-bottom: ${(p) => p.theme.border.thinLight};

  transition: 0.15s background;
  background: ${(p) => (p.active ? p.theme.color.bg.blueLight : 'transparent')};
  :hover {
    background: ${(p) => p.theme.color.bg.blueLight};
  }
`;

export default TaskListRow;
