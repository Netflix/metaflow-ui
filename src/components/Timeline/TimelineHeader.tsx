import React, { useState } from 'react';
import { GraphState, GraphAlignment, GraphGroupBy, GraphSortBy } from './useGraph';
import { TextInputField, CheckboxField, SelectField } from '../Form';
import { ItemRow } from '../Structure';
import { Text } from '../Text';
import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import styled from 'styled-components';
import { SortIcon } from '../Icon';

type TimelineHeaderProps = {
  zoom: (dir: 'in' | 'out') => void;
  zoomReset: () => void;
  changeMode: (alingment: GraphAlignment) => void;
  toggleGroupBy: (by: GraphGroupBy) => void;
  updateSortBy: (by: GraphSortBy) => void;
  updateSortDir: () => void;
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
  updateSortDir,
  expandAll,
  collapseAll,
}) => {
  return (
    <TimelineHeaderContainer>
      <TimelineHeaderTop>
        <ItemRow>
          <TimelineHeaderItem>
            <TextInputField placeholder="Search..." />
          </TimelineHeaderItem>
          <TimelineHeaderItem pad="sm">
            <Text>Status:</Text>
            <SelectField
              options={[
                ['All', 'all'],
                ['Completed', 'completed'],
              ]}
            />
          </TimelineHeaderItem>

          <Labeled label="Order by:">
            <ButtonGroup>
              <Button size="sm" onClick={() => updateSortBy('startTime')} active={graph.sortBy === 'startTime'}>
                Started at
              </Button>
              <Button size="sm" onClick={() => updateSortBy('duration')} active={graph.sortBy === 'duration'}>
                Duration
              </Button>
            </ButtonGroup>
          </Labeled>
        </ItemRow>
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
          <ItemRow>
            <TimelineDirectionButton onClick={() => updateSortDir()}>
              <span>Direction</span>
              <SortIcon
                size="sm"
                active
                direction={graph.sortDir === 'asc' ? 'up' : 'down'}
                rotate={graph.sortDir === 'asc' ? 0 : 180}
              />
            </TimelineDirectionButton>
            <CheckboxField
              label="Left align"
              checked={graph.alignment === 'fromLeft'}
              onChange={() => changeMode(graph.alignment === 'fromLeft' ? 'fromStartTime' : 'fromLeft')}
            />
          </ItemRow>

          <Labeled label="Zoom:">
            <ButtonGroup>
              <Button size="sm" onClick={() => zoomReset()} active={!graph.controlled}>
                Fit to screen
              </Button>
              <Button size="sm" onClick={() => zoom('out')}>
                -
              </Button>
              <Button size="sm" onClick={() => zoom('in')}>
                +
              </Button>
            </ButtonGroup>
          </Labeled>
        </TimelineHeaderBottomRight>
      </TimelineHeaderBottom>
    </TimelineHeaderContainer>
  );
};

const TimelineHeaderContainer = styled.div`
  border-bottom: 2px solid ${(p) => p.theme.color.border.mid};
  font-size: 14px;
`;

const TimelineHeaderTop = styled.div`
  padding: 0.5rem 0 1.5rem;
  border-bottom: 1px solid ${(p) => p.theme.color.border.mid};
  display: flex;
`;

const TimelineHeaderBottom = styled.div`
  display: flex;

  .field.field-checkbox {
    margin-bottom: 0;
  }
`;

const TimelineHeaderBottomLeft = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  width: 225px;
  border-right: 1px solid ${(p) => p.theme.color.border.mid};
`;

const TimelineHeaderBottomRight = styled.div`
  padding: 0.75rem;
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

const TimelineDirectionButton = styled.div`
  cursor: pointer;
  padding: 0.25rem 1rem 0.25rem 0.25rem;
  margin: 0 1rem 0 0;
  border-right: 1px solid ${(p) => p.theme.color.border.mid};

  span {
    margin-right: 0.5rem;
  }
`;

const Labeled: React.FC<{ label: string }> = ({ label, children }) => (
  <LabeledContainer>
    <label>{label}</label>
    <div>{children}</div>
  </LabeledContainer>
);

const TimelineHeaderItem = styled(ItemRow)`
  margin-right: ${(p) => p.theme.spacer.md}rem;
`;

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
      <Button active={open} onClick={() => setOpen(!open)}>
        ...
      </Button>
      {open && (
        <TemporaryPopup>
          <Button
            onClick={() => {
              expand();
              setOpen(false);
            }}
          >
            Expand all
          </Button>
          <br />
          <Button
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
