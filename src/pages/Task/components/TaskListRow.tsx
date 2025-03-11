import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TaskListLabel from '@components/Timeline/TaskListLabel';
import { getRowStatus } from '@components/Timeline/TimelineRow/utils';
import { Row } from '@components/Timeline/VirtualizedTimeline';

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
            tasksTotal={item.rowObject.tasksTotal}
            tasksVisible={item.rowObject.tasksVisible}
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
  border-bottom: var(--timeline-row-label-border-bottom);
  border-radius: var(--timeline-row-label-border-radius);

  transition: 0.15s background;
  background: ${(p) => (p.active ? 'var(--color-bg-secondary-highlight)' : 'transparent')};
  :hover {
    background: var(--color-bg-secondary-highlight);
  }
`;

export default TaskListRow;
