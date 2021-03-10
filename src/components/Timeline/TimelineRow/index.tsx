import React from 'react';
import styled, { css } from 'styled-components';
import { Row } from '../VirtualizedTimeline';
import { GraphState } from '../useGraph';
import { Link } from 'react-router-dom';
import { getPathFor } from '../../../utils/routing';
import { TFunction } from 'i18next';
import TaskListLabel from '../TaskListLabel';
import LineElement, { BoxGraphicValue } from './LineElement';

import { getTaskDuration } from '../../../utils/task';
import { getRowStatus, getStepDuration } from './utils';

type TimelineRowProps = {
  // Row type and data
  item?: Row;
  // Overall graph state (used to calculate dimensions)
  graph: GraphState;
  onOpen: () => void;
  isGrouped: boolean;
  isOpen?: boolean;
  // Flag row as sticky for some absolute stylings
  sticky?: boolean;
  paramsString?: string;
  t: TFunction;
  // Flag if we are dragging footer section. Need to remove animation in that case so rows don't seem clunky
  dragging: boolean;
};

const TimelineRow: React.FC<TimelineRowProps> = ({
  item,
  graph,
  onOpen,
  isOpen = true,
  isGrouped,
  paramsString,
  sticky,
  t,
  dragging,
}) => {
  if (!item || !item.data) return null;
  const Element = sticky ? StickyStyledRow : StyledRow;

  return (
    <>
      <Element>
        {item.type === 'step' ? (
          <TaskListLabel
            type="step"
            item={item.data}
            toggle={onOpen}
            open={isOpen}
            grouped={isGrouped}
            t={t}
            duration={getStepDuration(item.data, item.rowObject.status, item.rowObject.duration)}
            status={getRowStatus(item)}
          />
        ) : (
          <TaskListLabel
            type="task"
            item={item.data[item.data.length - 1]}
            open={isOpen}
            duration={item.data[item.data.length - 1].duration || null}
            grouped={isGrouped}
            paramsString={paramsString}
            status={getRowStatus({ type: 'task', data: item.data[item.data.length - 1] })}
            t={t}
          />
        )}
        <RowElement item={item} onOpen={onOpen}>
          {item.type === 'step' ? (
            <LineElement
              graph={graph}
              row={item}
              grayed={isOpen}
              duration={getStepDuration(item.data, item.rowObject.status, item.rowObject.duration)}
              isLastAttempt
              dragging={dragging}
            />
          ) : (
            item.data.map((task, index) => (
              <LineElement
                key={task.finished_at}
                graph={graph}
                row={{ type: 'task', data: task }}
                isLastAttempt={index === item.data.length - 1}
                duration={getTaskDuration(task)}
                startTimeOfFirstAttempt={graph.sortBy === 'duration' ? item.data[0].started_at || 0 : undefined}
                dragging={dragging}
              />
            ))
          )}
        </RowElement>
      </Element>
    </>
  );
};

const RowElement: React.FC<{ item: Row; onOpen: () => void }> = ({ item, children, onOpen }) => {
  if (item.type === 'task') {
    return (
      <RowGraphLinkContainer to={getPathFor.task(item.data[0])} data-testid="timeline-row-graphic-container">
        {children}
      </RowGraphLinkContainer>
    );
  }
  return (
    <RowGraphContainer onClick={onOpen} data-testid="timeline-row-graphic-container">
      {children}
    </RowGraphContainer>
  );
};

//
// Style
//

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  min-height: 28px;
  border-bottom: ${(p) => p.theme.border.thinLight};
  transition: background 0.15s;

  &:hover {
    background: ${(p) => p.theme.color.bg.blueLight};

    ${BoxGraphicValue} {
      &::after {
        background: ${(p) => p.theme.color.bg.blueLight};
      }
    }
  }
`;

const StickyStyledRow = styled(StyledRow)`
  position: absolute;
  background: ${(p) => p.theme.color.bg.white};
  top: 0;
  left: 0;
`;

const RowContainerStyles = css`
  position: relative;
  width: 100%;
  border-left: ${(p) => p.theme.border.thinLight};
  overflow-x: hidden;
`;

const RowGraphLinkContainer = styled(Link)`
  ${RowContainerStyles}
`;

const RowGraphContainer = styled.div`
  ${RowContainerStyles}
`;

export default TimelineRow;
