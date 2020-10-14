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
  groupped: boolean;
  isOpen?: boolean;
  toggle?: () => void;
};

const TaskListRow: React.FC<Props> = ({ index, style, item, toggle = () => null, groupped, isOpen = true }) => {
  const { t } = useTranslation();
  return (
    <TaskListRowContainer key={index} style={style}>
      {item.type === 'step' ? (
        item.data.step ? (
          <TaskListLabel
            type="step"
            item={item.data.step}
            duration={item.data.duration}
            toggle={toggle}
            open={isOpen}
            groupped={groupped}
            t={t}
          />
        ) : null
      ) : (
        <TaskListLabel type="task" item={item.data} open={isOpen} groupped={groupped} t={t} />
      )}
    </TaskListRowContainer>
  );
};

const TaskListRowContainer = styled.div`
  border-bottom: 1px solid #e8e8e8;
`;

export default TaskListRow;
