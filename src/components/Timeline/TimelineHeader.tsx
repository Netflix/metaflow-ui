import React, { useState } from 'react';
import { GraphState, GraphGroupBy, GraphSortBy } from './useGraph';
import { TextInputField, CheckboxField, SelectField } from '../Form';
import { ItemRow } from '../Structure';
import { Text } from '../Text';
import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import styled from 'styled-components';
import Icon, { SortIcon } from '../Icon';
import { useTranslation } from 'react-i18next';

export type TimelineHeaderProps = {
  zoom: (dir: 'in' | 'out') => void;
  zoomReset: () => void;
  toggleGroupBy: (by: GraphGroupBy) => void;
  updateSortBy: (by: GraphSortBy) => void;
  updateSortDir: () => void;
  expandAll: () => void;
  collapseAll: () => void;
  setFullscreen: () => void;
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
  setFullscreen,
}) => {
  const { t } = useTranslation();
  return (
    <TimelineHeaderContainer>
      <TimelineHeaderTop>
        <ItemRow pad="lg">
          <TimelineHeaderItem>
            <TextInputField disabled={true} horizontal placeholder="Search not implemented..." />
          </TimelineHeaderItem>
          <TimelineHeaderItem pad="sm">
            <Text>{t('fields.status')}:</Text>
            <SelectField
              horizontal
              disabled={true}
              options={[
                ['All', 'all'],
                ['Completed', 'completed'],
              ]}
            />
          </TimelineHeaderItem>
          <Button onClick={() => setFullscreen()}>Show fullscreen</Button>
        </ItemRow>
      </TimelineHeaderTop>

      <TimelineHeaderBottom>
        <TimelineHeaderBottomLeft>
          <CheckboxField
            label={t('timeline.group-by-step')}
            checked={graph.groupBy === 'step'}
            onChange={() => toggleGroupBy(graph.groupBy === 'step' ? 'none' : 'step')}
            data-testid="timeline-header-groupby-step"
          />
          <SettingsButton expand={() => expandAll()} collapse={() => collapseAll()} />
        </TimelineHeaderBottomLeft>
        <TimelineHeaderBottomRight>
          <ItemRow>
            <Text>{t('timeline.order-by')}:</Text>
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
                data-testid="timeline-header-orderby-startedat"
              >
                {t('timeline.started-at')}
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
                data-testid="timeline-header-orderby-duration"
              >
                {t('timeline.duration')}
                {graph.sortBy === 'duration' ? <HeaderSortIcon dir={graph.sortDir} /> : null}
              </Button>
            </ButtonGroup>
          </ItemRow>

          <ItemRow className="">
            <Text>{t('timeline.zoom')}:</Text>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={() => zoomReset()}
                active={!graph.controlled}
                data-testid="timeline-header-zoom-fit"
              >
                {t('timeline.fit-to-screen')}
              </Button>
              <Button size="sm" onClick={() => zoom('out')} data-testid="timeline-header-zoom-out">
                <Icon name="minus" />
              </Button>
              <Button size="sm" onClick={() => zoom('in')} data-testid="timeline-header-zoom-in">
                <Icon name="plus" />
              </Button>
            </ButtonGroup>
          </ItemRow>
        </TimelineHeaderBottomRight>
      </TimelineHeaderBottom>
    </TimelineHeaderContainer>
  );
};

const HeaderSortIcon: React.FC<{ dir: 'asc' | 'desc' }> = ({ dir }) => (
  <SortIcon padLeft size="sm" active direction={dir === 'asc' ? 'up' : 'down'} />
);

const TimelineHeaderContainer = styled.div`
  border-bottom: 2px solid ${(p) => p.theme.color.border.light};
  font-size: 14px;
`;

const TimelineHeaderTop = styled.div`
  padding-bottom: ${(p) => p.theme.spacer.md}rem;
  border-bottom: 1px solid ${(p) => p.theme.color.border.light};
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
  padding: ${(p) => p.theme.spacer.md}rem;
  width: 225px;
  border-right: 1px solid ${(p) => p.theme.color.border.light};
`;

const TimelineHeaderBottomRight = styled.div`
  padding: ${(p) => p.theme.spacer.md}rem;
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

const TimelineHeaderItem = styled(ItemRow)``;

const SettingsButton: React.FC<{ expand: () => void; collapse: () => void }> = ({ expand, collapse }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Button active={open} onClick={() => setOpen(!open)} data-testid="timeline-settings-button">
        <Icon name="ellipsis" />
      </Button>
      {open && (
        <TemporaryPopup>
          <Button
            onClick={() => {
              expand();
              setOpen(false);
            }}
            data-testid="timeline-settings-expand-all"
          >
            {t('timeline.expand-all')}
          </Button>
          <br />
          <Button
            onClick={() => {
              collapse();
              setOpen(false);
            }}
            data-testid="timeline-settings-collapse-all"
          >
            {t('timeline.collapse-all')}
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
