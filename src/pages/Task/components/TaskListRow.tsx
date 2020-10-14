import React from 'react';
import styled from 'styled-components';
import { TaskListRowItem } from './TaskList';
import TaskListLabel from '../../../components/Timeline/TaskListLabel';
import { useTranslation } from 'react-i18next';

type Props = {
  index: number;
  style: React.CSSProperties;
  item: TaskListRowItem;
  active: boolean;
  grouped: boolean;
  isOpen?: boolean;
  toggle?: () => void;
};

const TaskListRow: React.FC<Props> = ({ index, style, item, toggle = () => null, grouped, isOpen = true, active }) => {
  const { t } = useTranslation();
  return (
    <TaskListRowContainer key={index} style={style} active={active}>
      {item.type === 'step' ? (
        item.data.step ? (
          <TaskListLabel
            type="step"
            item={item.data.step}
            duration={item.data.duration}
            toggle={toggle}
            open={isOpen}
            grouped={grouped}
            t={t}
          />
        ) : null
      ) : (
        <TaskListLabel type="task" item={item.data} open={isOpen} grouped={grouped} t={t} />
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
