import React, { useCallback, useEffect, useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import styled from 'styled-components';

import TimelineRow from './TimelineRow';
import { useTranslation } from 'react-i18next';
import TimelineFooter from './Footer';
import { TFunction } from 'i18next';
import { RenderedRows } from 'react-virtualized/dist/es/List';
import { toRelativeSize } from '../../utils/style';
import { Row } from './VirtualizedTimeline';
import { TasksSortBy } from './useTaskListSettings';
import { AsyncStatus } from '../../types';

const listStyle = { transition: 'height 0.25s' };

//
// Typedef
//
type StepIndex = { name: string; index: number };
type TimelineProps = {
  rows: Row[];
  timeline: TimelineMetrics;
  searchStatus?: AsyncStatus;
  footerType?: 'minimal' | 'minimap';
  paramsString?: string;
  customMinimumHeight?: number;
  onHandleMove?: (which: 'left' | 'right', to: number) => void;
  onMove?: (change: number) => void;
  onStepRowClick?: (stepid: string) => void;
};

export type TimelineMetrics = {
  startTime: number;
  endTime: number;
  visibleEndTime: number;
  visibleStartTime: number;
  sortBy: TasksSortBy;
  groupingEnabled: boolean;
};

//
// Component
//

export const SPACE_UNDER_TIMELINE = (type: 'minimal' | 'minimap'): number =>
  type === 'minimap' ? toRelativeSize(80) : toRelativeSize(38);
export const ROW_HEIGHT = toRelativeSize(28);

const Timeline: React.FC<TimelineProps> = ({
  rows,
  timeline,
  searchStatus,
  footerType = 'minimap',
  paramsString = '',
  customMinimumHeight = 31.25,
  onHandleMove = () => null,
  onMove = () => null,
  onStepRowClick = () => null,
}) => {
  const { t } = useTranslation();

  // Position of each step in timeline. Used to track if we should use sticky header (move to rowDataState?)
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  // Name of sticky header (if should be visible)
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);
  const [dragging, setDragging] = useState(false);

  // Update step position indexes (for sticky headers). We might wanna do this else where
  useEffect(() => {
    const stepPos: StepIndex[] = [];
    let index = 0;

    for (const current of rows) {
      index++;
      if (current.type === 'step') {
        stepPos.push({ name: current.data.step_name, index });
      }
    }

    setStepPositions(stepPos);
  }, [rows]);

  //
  // Event handling
  //

  const onRowsRendered = useCallback((params: RenderedRows) => {
    const stepNeedsSticky = timelineNeedStickyHeader(stepPositions, params.startIndex);

    if (stepNeedsSticky) {
      setStickyHeader(stepNeedsSticky.name);
    } else {
      if (stickyHeader) {
        setStickyHeader(null);
      }
    }
  }, []);

  const rowRenderer = useCallback(
    () =>
      createRowRenderer({
        rows,
        timeline,
        searchStatus,
        onStepRowClick,
        paramsString,
        t: t,
        dragging: dragging,
      }),
    [],
  );

  const handleToggle = () => {
    if (stickyHeader) onStepRowClick(stickyHeader);
  };

  const autosizerContents = useCallback(
    ({ width, height }) => (
      <>
        <List
          overscanRowCount={10}
          rowCount={rows.length}
          onRowsRendered={onRowsRendered}
          rowHeight={ROW_HEIGHT}
          rowRenderer={rowRenderer}
          height={
            height - SPACE_UNDER_TIMELINE(footerType) > rows.length * ROW_HEIGHT
              ? rows.length * ROW_HEIGHT
              : height - SPACE_UNDER_TIMELINE(footerType)
          }
          width={width}
          style={listStyle}
        />
        {stickyHeader && timeline.groupingEnabled && (
          <StickyHeader
            stickyStep={stickyHeader}
            items={rows}
            timeline={timeline}
            onToggle={handleToggle}
            t={t}
            dragging={dragging}
          />
        )}

        <div style={{ width: width + 'px' }}>
          <TimelineFooter
            {...(footerType === 'minimap'
              ? {
                  type: 'minimap',
                  props: {
                    timeline,
                    rows,
                    onMove: onMove,
                    onHandleMove: onHandleMove,
                    onDraggingStateChange: setDragging,
                  },
                }
              : {
                  type: 'minimal',
                  props: {
                    startTime: timeline.startTime,
                    visibleStartTime: timeline.visibleStartTime,
                    visibleEndtime: timeline.visibleEndTime,
                  },
                })}
          />
        </div>
      </>
    ),
    [],
  );

  return (
    <ListContainer customMinHeight={customMinimumHeight}>
      <AutoSizer>{autosizerContents}</AutoSizer>
    </ListContainer>
  );
};

//
// Utils
//

type RowRendererProps = {
  rows: Row[];
  timeline: TimelineMetrics;
  searchStatus?: AsyncStatus;
  onStepRowClick: (steid: string) => void;
  paramsString: string;
  t: TFunction;
  dragging: boolean;
};

function getUniqueKey(index: number, row: Row) {
  const key = index + row.type;
  if (row.type === 'step') {
    return key + row.data.step_name;
  } else {
    return key + row.data[0]?.task_id;
  }
}

function createRowRenderer({
  rows,
  timeline,
  searchStatus,
  onStepRowClick,
  paramsString = '',
  t,
  dragging,
}: RowRendererProps) {
  return ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    return (
      <div style={style} key={getUniqueKey(index, row)}>
        <TimelineRow
          item={row}
          timeline={timeline}
          searchStatus={searchStatus}
          isOpen={row.type === 'step' && row.rowObject.isOpen}
          onOpen={() => row.type === 'step' && onStepRowClick(row.data.step_name)}
          paramsString={paramsString}
          t={t}
          dragging={dragging}
        />
      </div>
    );
  };
}

function timelineNeedStickyHeader(stepPositions: StepIndex[], currentIndex: number) {
  return stepPositions.find((item, index) => {
    const isLast = index + 1 === stepPositions.length;

    if (item.index < currentIndex && (isLast || stepPositions[index + 1].index > currentIndex + 1)) {
      return true;
    }
    return false;
  });
}

const StickyHeader: React.FC<{
  stickyStep: string;
  items: Row[];
  timeline: TimelineMetrics;
  t: TFunction;
  onToggle: () => void;
  dragging: boolean;
}> = ({ stickyStep, items, timeline, onToggle, t, dragging }) => {
  const item = items.find((item) => item.type === 'step' && item.data.step_name === stickyStep);

  if (!item || item.type !== 'step') return null;

  return (
    <TimelineRow item={item} isOpen={true} timeline={timeline} onOpen={onToggle} t={t} dragging={dragging} sticky />
  );
};

//
// Style
//

const ListContainer = styled.div<{ customMinHeight: number }>`
  flex: 1;
  min-height: ${(p) => `${p.customMinHeight}rem`};
  max-width: 100%;
  position: relative;
`;

export default Timeline;
