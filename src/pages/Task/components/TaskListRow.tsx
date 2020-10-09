import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Icon from '../../../components/Icon';
import { formatDuration } from '../../../utils/format';
import { getPath } from '../../../utils/routing';
import { TaskListRowItem } from './TaskList';

type Props = {
  index: number;
  style: React.CSSProperties;
  item: TaskListRowItem;
  active: boolean;
  isOpen?: boolean;
  toggle?: () => void;
};

const TaskListRow: React.FC<Props> = ({ index, style, item, toggle, isOpen, active }) => {
  const history = useHistory();

  return (
    <div
      key={index}
      style={style}
      onClick={() => {
        if (item.type === 'task') {
          history.push(getPath.task(item.data.flow_id, item.data.run_number, item.data.step_name, item.data.task_id));
        }
      }}
    >
      <RowContainer active={active} onClick={() => (toggle ? toggle() : null)}>
        <RowIconSection rowType={item.type}>
          {item.type === 'step' ? <Icon name="arrowDown" rotate={isOpen ? -90 : 0} size="xs" /> : null}
        </RowIconSection>

        <RowTextContent rowType={item.type}>
          <RowMainLabel itemType={item.type}>
            {item.type === 'step' ? item.data.step?.step_name || '' : item.data.task_id}
          </RowMainLabel>
          <RowDuration>{item.data.duration ? formatDuration(item.data.duration, 1) : '-'}</RowDuration>
        </RowTextContent>
      </RowContainer>
    </div>
  );
};

export default TaskListRow;

const RowContainer = styled.div<{ active?: boolean }>`
  display: flex;
  cursor: pointer;

  transition: background 0.15s;
  background: ${(p) => (p.active ? p.theme.color.bg.blueLight : 'transparent')};
  &:hover {
    background: ${(p) => p.theme.color.bg.blueLight};
  }
`;

const RowMainLabel = styled.div<{ itemType: string }>`
  font-family: monospace;
  font-weight: ${(p) => (p.itemType === 'step' ? 'bold' : 'normal')};
  overflow-x: hidden;
  white-space: nowrap;
`;

const RowTextContent = styled.div<{ rowType: 'step' | 'task'; active?: boolean }>`
  display: flex;
  justify-content: space-between;
  flex: 1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  line-height: 27px;
  max-width: 215px;
  padding: 0 10px;
  color: #333;
  background: ${(p) => (p.active ? '#E4F0FF' : 'transparent')};
`;

const RowIconSection = styled.div<{ rowType: 'step' | 'task' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  color: #717171;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const RowDuration = styled.div`
  min-width: 50px;
  text-align: right;
  white-space: nowrap;
  padding-left: 0.5rem;
  color: #666;
`;
