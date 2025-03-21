import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import GroupBy from '@pages/Home/Filters/GroupBy';
import StatusSelection from '@pages/Home/Filters/StatusSelection';
import TagFilter from '@pages/Home/Filters/TagFilter';
import TimerangeSelection from '@pages/Home/Filters/TimerangeSelection';
import { isDefaultParams } from '@pages/Home/Home.utils';
import Button from '@components/Button';
import AutoComplete from '@components/FilterInput/AutoCompleteFilter';
import { Text } from '@components/Text';
import { TimezoneContext } from '@components/TimezoneProvider';

//
// Typedef
//

type Props = {
  // Update queryparameter
  handleParamChange: (key: string, value: string) => void;
  // Update parameter that is type of list
  updateListValue: (key: string, value: string) => void;
  // Current active parameters
  params: Record<string, string>;
  // Reset all params
  resetAllFilters: () => void;
};

//
// Component
//

const HomeFilters: React.FC<Props> = ({ handleParamChange, updateListValue, params, resetAllFilters }) => {
  const { t } = useTranslation();
  const { timezone } = useContext(TimezoneContext);

  const clear = (key: string) => handleParamChange(key, '');

  return (
    <FiltersContainer>
      <GroupBy onChange={(value) => handleParamChange('_group', value)} group={params._group} />

      <StatusSelection
        updateField={updateListValue}
        onClear={() => handleParamChange('status', '')}
        status={params.status}
      />

      <TimerangeSelection
        onChange={({ start, end }) => {
          handleParamChange('timerange_start', start ? start.toString() : '');
          handleParamChange('timerange_end', end ? end.toString() : '');
        }}
        value={{
          start: params.timerange_start ? parseInt(params.timerange_start) : null,
          end: params.timerange_end ? parseInt(params.timerange_end) : null,
        }}
      />

      <AutoComplete
        data-testid="filter-input-flow"
        onSelect={(v) => updateListValue('flow_id', v)}
        label={t('fields.flow')}
        inputProps={{ placeholder: t('filters.flow-placeholder') as string }}
        value={params.flow_id}
        autoCompleteSettings={{
          url: '/flows/autocomplete',
          params: (str) => ({ 'flow_id:co': str }),
        }}
        onClear={() => clear('flow_id')}
      />

      <TagFilter
        data-testid="filter-input-project"
        onSelect={(v) => updateListValue('_tags', v.startsWith('project:') ? v : `project:${v}`)}
        onClear={() => handleParamChange('_tags', removeTypeFromTagsList('project', params._tags))}
        label={t('filters.project')}
        inputProps={{ placeholder: t('filters.project-placeholder') as string }}
        tags={params._tags}
        prefix="project"
        autoCompleteInputTransform={(input: string) => ({ 'tag:re': `project:.*${input}.*` })}
      />

      <TagFilter
        data-testid="filter-input-branch"
        onSelect={(v) => updateListValue('_tags', v.startsWith('project_branch:') ? v : `project_branch:${v}`)}
        onClear={() => handleParamChange('_tags', removeTypeFromTagsList('project_branch', params._tags))}
        label={t('fields.branch')}
        inputProps={{ placeholder: t('filters.branch-placeholder') as string }}
        tags={params._tags}
        prefix="project_branch"
        autoCompleteInputTransform={(input: string) => ({ 'tag:re': `project_branch:.*${input}.*` })}
      />

      <TagFilter
        data-testid="filter-input-user"
        onSelect={(v) => updateListValue('user', omitFromString('user', v))}
        onClear={() => clear('user')}
        label={t('fields.user')}
        inputProps={{ placeholder: t('filters.user-placeholder') as string }}
        tags={params.user
          ?.split(',')
          .map((u) => `user:${u}`)
          .join(',')}
        prefix="user"
        autoCompleteInputTransform={(input: string) => ({ 'tag:re': `user:.*${input}.*` })}
      />

      <TagFilter
        data-testid="filter-input-tag"
        onSelect={(v) => updateListValue('_tags', v)}
        onClear={() =>
          handleParamChange(
            '_tags',
            params._tags
              ?.split(',')
              .filter((x) => /^project:|project_branch:/.test(x))
              .join(','),
          )
        }
        label={t('fields.tag')}
        inputProps={{ placeholder: t('filters.tag-placeholder') as string }}
        tags={params._tags
          ?.split(',')
          .filter((x) => !/^project:|project_branch:/.test(x))
          .join(',')}
        autoCompleteInputTransform={(input: string) => ({ 'tag:co': input })}
      />

      <Trailing>
        <ButtonResetAll
          variant="primaryText"
          size="sm"
          onClick={() => resetAllFilters()}
          disabled={isDefaultParams(params, true, timezone)}
        >
          <Text>{t('filters.reset-all')}</Text>
        </ButtonResetAll>
      </Trailing>
    </FiltersContainer>
  );
};

//
// Utils
//

function omitFromString(partToOmit: string, str: string): string {
  return str.startsWith(partToOmit + ':') ? str.split(':').slice(1, str.split(':').length).join('') : str;
}

function removeTypeFromTagsList(type: string, tags: string): string {
  if (!tags) return '';
  return tags
    .split(',')
    .filter((tag) => !tag.startsWith(`${type}:`))
    .join(',');
}

//
// Styles
//

const ButtonResetAll = styled(Button)`
  white-space: nowrap;
`;

const FiltersContainer = styled.div`
  display: flex;
  font-size: var(--font-size-primary);
  padding: 1rem 0;
  justify-content: space-between;

  display: flex;
  gap: 6px;
  flex: 1;
`;

const Trailing = styled.div`
  margin-left: auto;
`;

export default HomeFilters;
