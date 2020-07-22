import React, { useState } from 'react';
import { GraphState, GraphGroupBy, GraphSortBy } from './useGraph';
import { TextInputField, CheckboxField, SelectField } from '../Form';
import { ItemRow } from '../Structure';
import { Text } from '../Text';
import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import styled from 'styled-components';
import Icon, { SortIcon } from '../Icon';

type TimelineHeaderProps = {
  zoom: (dir: 'in' | 'out') => void;
  zoomReset: () => void;
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
            <TextInputField disabled={true} horizontal placeholder="Search not implemented..." />
          </TimelineHeaderItem>
          <TimelineHeaderItem pad="sm">
            <Text>Status:</Text>
            <SelectField
              horizontal
              disabled={true}
              options={[
                ['All', 'all'],
                ['Completed', 'completed'],
              ]}
            />
          </TimelineHeaderItem>
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
            <Labeled label="Order by:">
              <ButtonGroup>
                <Button
                  size="sm"
                  onClick={() => {
                    if (graph.sortBy === 'startTime') {
                      updateSortDir();
                    } else {
                      updateSortBy('startTime');
                    }
                  }}
                  active={graph.sortBy === 'startTime'}
                >
                  Started at
                  {graph.sortBy === 'startTime' ? <HeaderSortIcon dir={graph.sortDir} /> : null}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (graph.sortBy === 'duration') {
                      updateSortDir();
                    } else {
                      updateSortBy('duration');
                    }
                  }}
                  active={graph.sortBy === 'duration'}
                >
                  Duration
                  {graph.sortBy === 'duration' ? <HeaderSortIcon dir={graph.sortDir} /> : null}
                </Button>
              </ButtonGroup>
            </Labeled>
          </ItemRow>

          <Labeled label="Zoom:">
            <ButtonGroup>
              <Button size="sm" onClick={() => zoomReset()} active={!graph.controlled}>
                Fit to screen
              </Button>
              <Button size="sm" onClick={() => zoom('out')}>
                <Icon name="minus" />
              </Button>
              <Button size="sm" onClick={() => zoom('in')}>
                <Icon name="plus" />
              </Button>
            </ButtonGroup>
          </Labeled>
        </TimelineHeaderBottomRight>
      </TimelineHeaderBottom>
    </TimelineHeaderContainer>
  );
};

const HeaderSortIcon: React.FC<{ dir: 'asc' | 'desc' }> = ({ dir }) => (
  <SortIcon padLeft size="sm" active direction={dir === 'asc' ? 'up' : 'down'} />
);

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
        <Icon name="ellipsis" />
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
