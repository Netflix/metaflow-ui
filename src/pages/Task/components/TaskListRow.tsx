import React from 'react';
import styled from 'styled-components';
import TaskListLabel from '../../../components/Timeline/TaskListLabel';
import { useTranslation } from 'react-i18next';
import { Row } from '../../../components/Timeline/VirtualizedTimeline';

type Props = {
  index: number;
  style: React.CSSProperties;
  item: Row;
  active: boolean;
  grouped: boolean;
  isOpen?: boolean;
  toggle?: () => void;
  paramsString?: string;
};

const TaskListRow: React.FC<Props> = ({
  index,
  style,
  item,
  toggle = () => null,
  grouped,
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
            duration={item.rowObject.duration}
            toggle={toggle}
            open={isOpen}
            grouped={grouped}
            t={t}
          />
        ) : null
      ) : (
        <TaskListLabel
          type="task"
          item={item.data[0]}
          open={isOpen}
          grouped={grouped}
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
