import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { CheckboxField, DropdownField } from '../../../components/Form';
import { Section, SectionHeader } from '../../../components/Structure';
import Button from '../../../components/Button';
import { Text } from '../../../components/Text';
import { RemovableTag } from '../../../components/Tag';
import FilterInput from '../../../components/FilterInput';

import FEATURE from '../../../utils/FEATURE';
import { isDefaultParams, paramList } from '../Home.utils';

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
      {FEATURE.RUN_GROUPS && (
        <DropdownWrapper>
          <DropdownField
            horizontal
            label={t('filters.group-by')}
            noMinWidth
            value={params._group || ''}
            onChange={(e) => e && handleParamChange('_group', e.target.value)}
            options={[
              ['', t('fields.group.none')],
              ['flow_id', t('fields.group.flow')],
              ['user', t('fields.group.user')],
            ]}
          />
        </DropdownWrapper>
      )}

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

      <ParametersWrapper>
        <FilterInput onSubmit={(v) => updateListValue('flow_id', v)} sectionLabel={t('fields.flow')} />
        <TagParameterList paramKey="flow_id" updateList={updateListValue} value={params.flow_id} />
      </ParametersWrapper>

      <ParametersWrapper>
        <FilterInput onSubmit={(v) => updateListValue('_tags', `project:${v}`)} sectionLabel={t('fields.project')} />
        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => x.startsWith('project:')).map((x) => x.substr('project:'.length))}
          mapValue={(x) => `project:${x}`}
          updateList={updateListValue}
          value={params._tags}
        />
      </ParametersWrapper>

      <ParametersWrapper>
        <FilterInput onSubmit={(v) => updateListValue('user', v)} sectionLabel={t('fields.user')} />
        <TagParameterList
          paramKey="user"
          updateList={updateListValue}
          value={params.user ? params.user.replace('null', 'None') : ''}
        />
      </ParametersWrapper>

      <ParametersWrapper>
        <FilterInput onSubmit={(v) => updateListValue('_tags', v)} sectionLabel={t('fields.tag')} />
        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => !/^project:/.test(x))}
          updateList={updateListValue}
          value={params._tags}
        />
      </ParametersWrapper>

      {!defaultFiltersActive && (
        <div>
          <ButtonResetAll size="sm" onClick={() => resetAllFilters()} disabled={isDefaultParams(params)}>
            <Text>{t('filters.reset-all')}</Text>
          </ButtonResetAll>
        </div>
      )}
    </Sidebar>
  );
};

const ButtonResetAll = styled(Button)`
  width: 100%;
  color: #333;
  span {
    display: inline-block;
    width: 100%;
  }
`;

const StyledRemovableTag = styled(RemovableTag)`
  align-items: center;
  min-height 2rem;
  margin-right: ${(p) => p.theme.spacer.sm}rem;
  margin-top: ${(p) => p.theme.spacer.sm}rem;
  word-break: break-all;
`;

const Sidebar = styled.div`
  position: fixed;
  width: ${(p) => p.theme.layout.sidebarWidth}rem;
  top: ${(p) => p.theme.layout.appbarHeight}rem;
  font-size: 0.875rem;
  padding-top: 6px;
`;

const DropdownWrapper = styled.div`
  margin: 0 0 1rem;
`;

const ParametersWrapper = styled.div`
  margin: 0 0 1rem;
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
