import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { paramList, isDefaultParams } from '../index';

import { CheckboxField, DropdownField } from '../../../components/Form';
import { Section, SectionHeader } from '../../../components/Structure';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import { Text } from '../../../components/Text';
import { RemovableTag } from '../../../components/Tag';
import FilterInput from '../../../components/FilterInput';

type Props = {
  // Update queryparameter
  handleParamChange: (key: string, value: string) => void;
  // Update parameter that is type of list
  updateListValue: (key: string, value: string) => void;
  // Current active parameters
  params: Record<string, string>;
  // Are default filters currently active
  defaultFiltersActive: boolean;
  // Reset all params
  resetAllFilters: () => void;
};

const HomeSidebar: React.FC<Props> = ({
  handleParamChange,
  updateListValue,
  params,
  defaultFiltersActive,
  resetAllFilters,
}) => {
  const { t } = useTranslation();

  return (
    <Sidebar className="sidebar">
      <Section>
        <SectionHeader>
          <DropdownField
            horizontal
            noMinWidth
            value={params._group || ''}
            onChange={(e) => e && handleParamChange('_group', e.target.value)}
            options={[
              ['', t('fields.group.none')],
              ['flow_id', t('fields.group.flow')],
              ['user_name', t('fields.group.user')],
            ]}
          />
        </SectionHeader>
      </Section>

      <Section>
        <SectionHeader>{t('fields.status')}</SectionHeader>
        <StatusCheckboxField
          label={t('filters.running')}
          value="running"
          activeStatus={params.status}
          updateField={updateListValue}
        />
        <StatusCheckboxField
          label={t('filters.failed')}
          value="failed"
          activeStatus={params.status}
          updateField={updateListValue}
        />
        <StatusCheckboxField
          label={t('filters.completed')}
          value="completed"
          activeStatus={params.status}
          updateField={updateListValue}
        />
      </Section>

      <Section>
        <FilterInput onSubmit={(v) => updateListValue('flow_id', v)} sectionLabel={t('fields.flow')} />

        <TagParameterList paramKey="flow_id" updateList={updateListValue} value={params.flow_id} />
      </Section>

      <Section>
        <FilterInput onSubmit={(v) => updateListValue('_tags', `project:${v}`)} sectionLabel={t('fields.project')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => x.startsWith('project:')).map((x) => x.substr('project:'.length))}
          mapValue={(x) => `project:${x}`}
          updateList={updateListValue}
          value={params._tags}
        />
      </Section>

      <Section>
        <FilterInput onSubmit={(v) => updateListValue('_tags', `user:${v}`)} sectionLabel={t('fields.user')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => x.startsWith('user:')).map((x) => x.substr('user:'.length))}
          mapValue={(x) => `user:${x}`}
          updateList={updateListValue}
          value={params._tags}
        />
      </Section>

      <Section>
        <FilterInput onSubmit={(v) => updateListValue('_tags', v)} sectionLabel={t('fields.tag')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => !/^user:|project:/.test(x))}
          updateList={updateListValue}
          value={params._tags}
        />
      </Section>

      {!defaultFiltersActive && (
        <Section>
          <ButtonResetAll size="sm" onClick={() => resetAllFilters()} disabled={isDefaultParams(params)}>
            <Icon name="times" padRight />
            <Text>{t('filters.reset-all')}</Text>
          </ButtonResetAll>
        </Section>
      )}
    </Sidebar>
  );
};

const ButtonResetAll = styled(Button)`
  width: 100%;
  span {
    display: inline-block;
    width: 100%;
  }
`;

const StyledRemovableTag = styled(RemovableTag)`
  word-break: break-all;
  margin-right: ${(p) => p.theme.spacer.xs}rem;
  margin-bottom: ${(p) => p.theme.spacer.xs}rem;
`;

const Sidebar = styled.div`
  position: fixed;
  width: ${(p) => p.theme.layout.sidebarWidth}rem;
  top: ${(p) => p.theme.layout.appbarHeight}rem;
  font-size: 0.875rem;
`;

export default HomeSidebar;

//
// Tag list
//

type TagParameterListProps = {
  paramKey: string;
  mapList?: (xs: string[]) => string[];
  mapValue?: (x: string) => string;
  updateList: (key: string, value: string) => void;
  value?: string;
};

const TagParameterList: React.FC<TagParameterListProps> = ({
  paramKey,
  mapList = (xs) => xs,
  mapValue = (x) => x,
  updateList,
  value,
}) => (
  <>
    {value
      ? mapList(paramList(value)).map((x, i) => (
          <StyledRemovableTag key={i} onClick={() => updateList(paramKey, mapValue(x))}>
            {x}
          </StyledRemovableTag>
        ))
      : null}
  </>
);

//
// Status field
//

type StatusFieldProps = {
  value: string;
  label: string;
  updateField: (key: string, value: string) => void;
  activeStatus?: string | null;
};

const StatusCheckboxField: React.FC<StatusFieldProps> = ({ value, label, updateField, activeStatus }) => {
  return (
    <CheckboxField
      label={label}
      className={`status-${value}`}
      checked={!!(activeStatus && activeStatus.indexOf(value) > -1)}
      onChange={() => {
        updateField('status', value);
      }}
    />
  );
};
