import React, { useState } from 'react';
import { GraphState, GraphAlignment, GraphGroupBy, GraphSortBy } from './useGraph';
import { TextInputField, CheckboxField, SelectField } from '../Form';
import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import styled from 'styled-components';

type TimelineHeaderProps = {
  zoom: (dir: 'in' | 'out') => void;
  zoomReset: () => void;
  changeMode: (alingment: GraphAlignment) => void;
  toggleGroupBy: (by: GraphGroupBy) => void;
  updateSortBy: (by: GraphSortBy) => void;
  expandAll: () => void;
  collapseAll: () => void;
  graph: GraphState;
};

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  graph,
  zoom,
  zoomReset,
  changeMode,
  toggleGroupBy,
  updateSortBy,
  expandAll,
  collapseAll,
}) => {
  return (
    <TimelineHeaderContainer>
      <TimelineHeaderTop>
        <TextInputField />
        <Labeled label="Status:">
          <SelectField
            options={[
              ['All', 'all'],
              ['Completed', 'completed'],
            ]}
          />
        </Labeled>
        <Labeled label="Order by:">
          <ButtonGroup
            buttons={[
              { label: 'Started at', action: () => updateSortBy('startTime'), active: graph.sortBy === 'startTime' },
              { label: 'Duration', action: () => updateSortBy('duration'), active: graph.sortBy === 'duration' },
            ]}
          />
        </Labeled>
      </TimelineHeaderTop>
      <TimelineHeaderBottom>
        <TimelineHeaderBottomLeft>
          <CheckboxField
            label="Group by step"
            checked={graph.groupBy === 'step'}
            onChange={() => toggleGroupBy(graph.groupBy === 'step' ? 'none' : 'step')}
          />
          <SettingsButton expand={() => expandAll()} collapse={() => collapseAll()} />
        </TimelineHeaderBottomLeft>
        <TimelineHeaderBottomRight>
          <TimelineHeaderBottomActions>
            <TimelineDirectionButton>direction</TimelineDirectionButton>
            <CheckboxField
              label="Left align"
              checked={graph.alignment === 'fromLeft'}
              onChange={() => changeMode(graph.alignment === 'fromLeft' ? 'fromStartTime' : 'fromLeft')}
            />
          </TimelineHeaderBottomActions>

          <Labeled label="Zoom:">
            <ButtonGroup
              buttons={[
                { label: 'Fit to screen', action: zoomReset, active: !graph.controlled },
                { label: '-', action: () => zoom('out') },
                { label: '+', action: () => zoom('in') },
              ]}
            />
          </Labeled>
        </TimelineHeaderBottomRight>
      </TimelineHeaderBottom>
    </TimelineHeaderContainer>
  );
};

const TimelineHeaderContainer = styled.div`
  border-bottom: 2px solid ${(p) => p.theme.color.border.normal};
  font-size: 14px;
`;

const TimelineHeaderTop = styled.div`
  padding: 0.5rem 0 1.5rem;
  border-bottom: 1px solid ${(p) => p.theme.color.border.normal};
  display: flex;
`;

const TimelineHeaderBottom = styled.div`
  display: flex;
`;

const TimelineHeaderBottomLeft = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  width: 225px;
  border-right: 1px solid ${(p) => p.theme.color.border.normal};
`;

const TimelineHeaderBottomRight = styled.div`
  padding: 0.75rem;
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

const TimelineHeaderBottomActions = styled.div`
  display: flex;
  align-items: center;
`;

const TimelineDirectionButton = styled.div`
  padding: 0.25rem 1rem 0.25rem 0.25rem;
  margin: 0 1rem 0 0;
  border-right: 1px solid ${(p) => p.theme.color.border.normal};
`;

const Labeled: React.FC<{ label: string }> = ({ label, children }) => (
  <LabeledContainer>
    <label>{label}</label>
    <div>{children}</div>
  </LabeledContainer>
);

const LabeledContainer = styled.div`
  margin: 0 1rem;
  display: flex;
  align-items: center;

  > label {
    font-size: 14px;
    color: ${(p) => p.theme.color.text.dark};
    margin-right: 0.5rem;
  }
`;

const SettingsButton: React.FC<{ expand: () => void; collapse: () => void }> = ({ expand, collapse }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Button layout="slim" onClick={() => setOpen(!open)}>
        ...
      </Button>
      {open && (
        <TemporaryPopup>
          <Button
            layout="slim"
            onClick={() => {
              expand();
              setOpen(false);
            }}
          >
            Expand all
          </Button>
          <br />
          <Button
            layout="slim"
            onClick={() => {
              collapse();
              setOpen(false);
            }}
          >
            Collapse all
          </Button>
        </TemporaryPopup>
      )}
    </div>
  );
};

const TemporaryPopup = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  padding: 10px;
  background: #fff;
  border: 1px solid #c8c8c8;
  z-index: 2;
  white-space: nowrap;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.06);
`;

export default TimelineHeader;
