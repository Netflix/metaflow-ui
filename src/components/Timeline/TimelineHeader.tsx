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
  isFullscreen: boolean;
  updateStatusFilter: (status: null | string) => void;
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
  isFullscreen,
  setFullscreen,
  updateStatusFilter,
}) => {
  const { t } = useTranslation();
  const SortButtonDef = (label: string, property: GraphSortBy) => (
    <SortButton
      label={label}
      property={property}
      current={graph.sortBy}
      direction={graph.sortDir}
      updateSortBy={updateSortBy}
      updateSortDir={updateSortDir}
    />
  );

  return (
    <TimelineHeaderContainer>
      <TimelineHeaderBottom>
        <TimelineHeaderBottomLeft>
          <TextInputField disabled={true} horizontal placeholder="Search not implemented..." />
          <SettingsButton
            expand={() => expandAll()}
            collapse={() => collapseAll()}
            groupBy={graph.groupBy}
            toggleGroupBy={toggleGroupBy}
          />
        </TimelineHeaderBottomLeft>
        <TimelineHeaderBottomRight>
          <ItemRow>
            <Text>{t('timeline.order-by')}:</Text>
            <ButtonGroup>
              {SortButtonDef(t('timeline.started-at'), 'startTime')}
              {SortButtonDef(t('timeline.finished-at'), 'endTime')}
              {SortButtonDef(t('timeline.duration'), 'duration')}
            </ButtonGroup>

            <TimelineHeaderItem pad="sm">
              <Text>{t('fields.status')}:</Text>
              <SelectField
                horizontal
                noMinWidth
                onChange={(e) => {
                  if (e?.target.value === 'all') {
                    updateStatusFilter(null);
                  } else {
                    updateStatusFilter(e?.target.value || null);
                  }
                }}
                options={[
                  ['all', t('run.filter-all')],
                  ['done', t('run.filter-completed')],
                  ['running', t('run.filter-running')],
                ]}
              />
            </TimelineHeaderItem>
          </ItemRow>

          <ItemRow>
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
            {!isFullscreen && (
              <Button onClick={() => setFullscreen()} withIcon>
                <Icon name="maximize" />
                <span>{t('run.show-fullscreen')}</span>
              </Button>
            )}
          </ItemRow>
        </TimelineHeaderBottomRight>
      </TimelineHeaderBottom>
    </TimelineHeaderContainer>
  );
};

const SortButton: React.FC<{
  label: string;
  property: GraphSortBy;
  current: GraphSortBy;
  direction: 'asc' | 'desc';
  updateSortDir: () => void;
  updateSortBy: (prop: GraphSortBy) => void;
}> = ({ current, label, property, direction, updateSortDir, updateSortBy }) => (
  <Button
    size="sm"
    onClick={() => {
      if (current === property) {
        updateSortDir();
      } else {
        updateSortBy(property);
      }
    }}
    active={current === property}
    data-testid={`timeline-header-orderby-${property}`}
  >
    {label}
    {current === property ? <HeaderSortIcon dir={direction} /> : null}
  </Button>
);
const HeaderSortIcon: React.FC<{ dir: 'asc' | 'desc' }> = ({ dir }) => (
  <SortIcon padLeft size="sm" active direction={dir === 'asc' ? 'up' : 'down'} />
);

const TimelineHeaderContainer = styled.div`
  border-bottom: 2px solid ${(p) => p.theme.color.border.light};
  font-size: 14px;
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
  align-items: center;
  padding: ${(p) => `${p.theme.spacer.md}rem ${p.theme.spacer.sm}rem ${p.theme.spacer.md}rem 0`};
  width: 225px;
  border-right: 1px solid ${(p) => p.theme.color.border.light};
`;

const TimelineHeaderBottomRight = styled.div`
  padding: ${(p) => p.theme.spacer.md}rem;
  padding-right: 0;
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

const TimelineHeaderItem = styled(ItemRow)`
  margin: 0 1rem;
`;

const SettingsButton: React.FC<{
  expand: () => void;
  collapse: () => void;
  groupBy: GraphGroupBy;
  toggleGroupBy: (gb: GraphGroupBy) => void;
}> = ({ expand, collapse, groupBy, toggleGroupBy }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <StyledSettingsButton>
      <Button active={open} onClick={() => setOpen(!open)} data-testid="timeline-settings-button">
        <Icon name="ellipsis" />
      </Button>
      {open && (
        <TemporaryPopup>
          <CheckboxField
            label={t('timeline.group-by-step')}
            checked={groupBy === 'step'}
            onChange={() => toggleGroupBy(groupBy === 'step' ? 'none' : 'step')}
            data-testid="timeline-header-groupby-step"
          />
          <br />
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
    </StyledSettingsButton>
  );
};

const StyledSettingsButton = styled.div`
  position: relative;
  button {
    height: 30px;
    margin-left: 0.5rem;
  }
`;

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
