import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Run } from '@/types';
import { TableColDefinition } from '@pages/Home/ResultGroup';
import ResultGroupCells from '@pages/Home/ResultGroup/Cells';
import ParametersPreview from '@pages/Home/ResultGroup/ParametersPreview';
import TimelinePreview from '@pages/Home/ResultGroup/TimelinePreview';
import HeightAnimatedContainer from '@components/HeightAnimatedContainer';
import { Section } from '@components/Structure';
import { TR } from '@components/Table';
import { TabsHeading, TabsHeadingItem } from '@components/Tabs';
import { getPath } from '@utils/routing';
import { getRunId } from '@utils/run';

//
// Typedef
//

type Props = {
  isStale: boolean;
  queryParams: Record<string, string>;
  updateListValue: (key: string, value: string) => void;
  run: Run;
  cols: TableColDefinition[];
};

enum RowState {
  Closed,
  Opening,
  Open,
  Closing,
}

//
// Row component that will lock it's state when hovered or set active
//
const ResultGroupRow: React.FC<Props> = ({ isStale, queryParams, updateListValue, run, cols }) => {
  const { t } = useTranslation();
  const [isHovering, setIsHovering] = useState(false);
  const [rowState, setRowState] = useState<RowState>(RowState.Closed);
  const [tab, setTab] = useState(0);
  const visible = isVisible(rowState);

  // Update state after 250 of closing or opening
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    if (isTransitioning(rowState)) {
      t1 = setTimeout(() => {
        setRowState((rs) => (rs === RowState.Opening ? RowState.Open : rs === RowState.Closing ? RowState.Closed : rs));
      }, 250);
    }
    return () => {
      clearTimeout(t1);
    };
  }, [rowState]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleToggleClick = () => {
    if (rowState === RowState.Opening || rowState === RowState.Open) {
      setRowState(RowState.Closing);
    } else {
      setRowState(RowState.Opening);
    }
  };

  return (
    <>
      <StyledTR
        data-testid="result-group-row"
        data-flow_id={run.flow_id}
        data-run_id={getRunId(run)}
        data-status={run.status}
        data-user={run.user}
        data-tags={(run.tags || []).join(' ')}
        clickable
        stale={isStale}
        active={visible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ResultGroupCells
          r={run}
          params={queryParams}
          updateListValue={updateListValue}
          link={getPath.run(run.flow_id, getRunId(run))}
          expand={{
            active: rowState === RowState.Opening || rowState === RowState.Open,
            visible: isHovering || visible,
            onClick: handleToggleClick,
          }}
        />
      </StyledTR>
      {visible && (
        <tr>
          <StyledTD colSpan={cols.length}>
            <HeightAnimatedContainer active={true}>
              <StyledSection closing={rowState === RowState.Closing}>
                <TabsHeading>
                  <TabsHeadingItem active={tab === 0} onClick={() => setTab(0)}>
                    {t('run.timeline')}
                  </TabsHeadingItem>
                  <TabsHeadingItem active={tab === 1} onClick={() => setTab(1)}>
                    {t('run.parameters')}
                  </TabsHeadingItem>
                </TabsHeading>
                {tab === 0 && <TimelinePreview run={run} />}
                {tab === 1 && <ParametersPreview run={run} />}
              </StyledSection>
            </HeightAnimatedContainer>
          </StyledTD>
        </tr>
      )}
    </>
  );
};

//
// Utils
//

function isVisible(rs: RowState) {
  return rs !== RowState.Closed;
}

function isTransitioning(rs: RowState) {
  return rs === RowState.Closing || rs === RowState.Opening;
}

//
// Styles
//

const StyledTR = styled(TR)`
  height: var(--result-group-row-height);
`;

// Need to align expand area by one pixel so that border is on correct position
const StyledTD = styled.td`
  padding-right: 1px;
  padding-bottom: 1px;
  position: relative;
  overflow: hidden;
`;

const StyledSection = styled(Section)<{ closing: boolean }>`
  padding: var(--result-group-expand-padding);
  margin-bottom 0;
  ${(p) => p.closing && 'position: absolute;'}
  width: 100%;
`;

export default ResultGroupRow;
