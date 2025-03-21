import { TFunction } from 'i18next';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { AsyncStatus } from '@/types';
import { getRowStatus, getStepDuration } from '@components/Timeline/TimelineRow/utils';
import { getPathFor } from '@utils/routing';
import { getTaskDuration } from '@utils/task';
import TaskListLabel from '../TaskListLabel';
import { TimelineMetrics } from '../Timeline';
import { Row } from '../VirtualizedTimeline';
import LineElement, { BoxGraphicValue } from './LineElement';

type TimelineRowProps = {
  // Row type and data
  item?: Row;
  // Overall timeline state (used to calculate dimensions)
  timeline: TimelineMetrics;
  onOpen: () => void;
  searchStatus?: AsyncStatus;
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
  timeline,
  searchStatus,
  onOpen,
  isOpen = true,
  paramsString,
  sticky,
  t,
  dragging,
}) => {
  if (!item || !item.data) return null;
  const Element = sticky ? StickyStyledRow : StyledRow;

  const { groupingEnabled, ...lineElementMetrics } = timeline;

  return (
    <>
      <Element>
        {item.type === 'step' ? (
          <TaskListLabel
            type="step"
            item={item.data}
            toggle={onOpen}
            open={isOpen}
            grouped={groupingEnabled}
            t={t}
            duration={getStepDuration(item.data, item.rowObject.status, item.rowObject.duration)}
            status={getRowStatus(item)}
            searchStatus={searchStatus}
            tasksTotal={item.rowObject.tasksTotal}
            tasksVisible={item.rowObject.tasksVisible}
          />
        ) : (
          <TaskListLabel
            type="task"
            item={item.data[item.data.length - 1]}
            open={isOpen}
            duration={item.data[item.data.length - 1].duration || null}
            grouped={groupingEnabled}
            paramsString={paramsString}
            status={getRowStatus({ type: 'task', data: item.data[item.data.length - 1] })}
            t={t}
          />
        )}
        <RowElement item={item} paramsString={paramsString} onOpen={onOpen}>
          {item.type === 'step' ? (
            <LineElement
              timeline={lineElementMetrics}
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
                timeline={lineElementMetrics}
                row={{ type: 'task', data: task }}
                isLastAttempt={index === item.data.length - 1}
                duration={getTaskDuration(task)}
                startTimeOfFirstAttempt={timeline.sortBy === 'duration' ? item.data[0].started_at || 0 : undefined}
                dragging={dragging}
                paramsString={paramsString}
              />
            ))
          )}
        </RowElement>
      </Element>
    </>
  );
};

const RowElement: React.FC<{ item: Row; children: ReactNode; onOpen: () => void; paramsString?: string }> = ({
  item,
  children,
  onOpen,
  paramsString,
}) => {
  if (item.type === 'task') {
    return (
      <RowGraphLinkContainer
        to={`${getPathFor.task(item.data[0])}?${paramsString}`}
        data-testid="timeline-row-graphic-container"
      >
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
  min-height: 1.75rem;
  transition: background 0.15s;

  &:hover {
    background: var(--color-bg-secondary-highlight);

    ${BoxGraphicValue} {
      &::after {
        background: var(--color-bg-secondary-highlight);
      }
    }
  }
`;

const StickyStyledRow = styled(StyledRow)`
  position: absolute;
  background: var(--color-bg-primary);
  top: 0;
  left: 0;
`;

const RowContainerStyles = css`
  position: relative;
  width: 100%;
  border-left: var(--timeline-row-separator-border);
  border-bottom: var(--timeline-row-border-bottom);
  overflow-x: hidden;
`;

const RowGraphLinkContainer = styled(Link)`
  ${RowContainerStyles}
`;

const RowGraphContainer = styled.div`
  ${RowContainerStyles}
`;

export default TimelineRow;
