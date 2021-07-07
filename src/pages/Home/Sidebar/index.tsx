import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import DropdownField from '../../../components/Form/Dropdown';
import Button from '../../../components/Button';
import { Text } from '../../../components/Text';
import FilterInput from '../../../components/FilterInput';

import FEATURE from '../../../utils/FEATURE';
import SidebarStatusSelection from './SidebarStatusSelection';
import { TagParameterList } from './SidebarTags';
import SidebarTimerangeSelection from './SidebarTimerangeSelection';
import { isDefaultParams } from '../Home.utils';
import { HEADER_SIZE_REM } from '../../../constants';
import { Scrollbars } from 'react-custom-scrollbars-2';

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
      {/* Add sidebar size to be 100% viewheight - (header size + 1 rem for padding) */}
      <Scrollbars
        style={{ height: `calc(100vh - ${HEADER_SIZE_REM + 1}rem)`, width: '15rem', paddingTop: '0.25rem' }}
        autoHide
      >
        <SidebarContent>
          {FEATURE.RUN_GROUPS && (
            <SidebarSectionWrapper>
              <DropdownField
                label={t('filters.group-by')}
                value={params._group || ''}
                onChange={(e) => e && handleParamChange('_group', e.target.value)}
                options={[
                  ['', t('fields.group.none')],
                  ['flow_id', t('fields.group.flow')],
                  ['user', t('fields.group.user')],
                ]}
              />
            </SidebarSectionWrapper>
          )}

          <SidebarStatusSelection updateField={updateListValue} status={params.status} />

          <SidebarTimerangeSelection updateField={handleParamChange} params={params} />

          <SidebarSectionWrapper data-testid="filter-input-flow">
            <FilterInput
              onSubmit={(v) => updateListValue('flow_id', v)}
              sectionLabel={t('fields.flow')}
              autoCompleteSettings={{
                url: '/flows/autocomplete',
                params: (str) => ({ 'flow_id:co': str }),
              }}
            />
            <TagParameterList paramKey="flow_id" updateList={updateListValue} value={params.flow_id} />
          </SidebarSectionWrapper>

          <SidebarSectionWrapper data-testid="filter-input-project">
            <FilterInput
              onSubmit={(v) => updateListValue('_tags', v.startsWith('project:') ? v : `project:${v}`)}
              sectionLabel={t('fields.project')}
              autoCompleteSettings={{
                url: '/tags/autocomplete',
                params: (input: string) => ({ 'tag:re': `project:.*${input}.*` }),
              }}
            />
            <TagParameterList
              paramKey="_tags"
              mapList={(xs) => xs.filter((x) => x.startsWith('project:')).map((x) => x.substr('project:'.length))}
              mapValue={(x) => `project:${x}`}
              updateList={updateListValue}
              value={params._tags}
            />
          </SidebarSectionWrapper>

          <SidebarSectionWrapper data-testid="filter-input-branch">
            <FilterInput
              onSubmit={(v) => updateListValue('_tags', v.startsWith('project_branch:') ? v : `project_branch:${v}`)}
              sectionLabel={t('fields.branch')}
              autoCompleteSettings={{
                url: '/tags/autocomplete',
                params: (input: string) => ({ 'tag:re': `project_branch:.*${input}.*` }),
              }}
            />
            <TagParameterList
              paramKey="_tags"
              mapList={(xs) =>
                xs.filter((x) => x.startsWith('project_branch:')).map((x) => x.substr('project_branch:'.length))
              }
              mapValue={(x) => `project_branch:${x}`}
              updateList={updateListValue}
              value={params._tags}
            />
          </SidebarSectionWrapper>

          <SidebarSectionWrapper data-testid="filter-input-user">
            <FilterInput
              onSubmit={(v) => updateListValue('user', omitFromString('user', v))}
              sectionLabel={t('fields.user')}
              autoCompleteSettings={{
                url: '/tags/autocomplete',
                params: (input: string) => ({ 'tag:re': `user:.*${input}.*` }),
              }}
            />
            <TagParameterList
              paramKey="user"
              updateList={updateListValue}
              value={params.user ? params.user.replace('null', 'None') : ''}
            />
          </SidebarSectionWrapper>

          <SidebarSectionWrapper data-testid="filter-input-tag">
            <FilterInput
              onSubmit={(v) => updateListValue('_tags', v)}
              sectionLabel={t('fields.tag')}
              autoCompleteSettings={{
                url: '/tags/autocomplete',
                params: (input: string) => ({ 'tag:co': input }),
              }}
            />
            <TagParameterList
              paramKey="_tags"
              mapList={(xs) => xs.filter((x) => !/^project:|project_branch:/.test(x))}
              updateList={updateListValue}
              value={params._tags}
            />
          </SidebarSectionWrapper>

          {!defaultFiltersActive && (
            <div>
              <ButtonResetAll size="sm" onClick={() => resetAllFilters()} disabled={isDefaultParams(params)}>
                <Text>{t('filters.reset-all')}</Text>
              </ButtonResetAll>
            </div>
          )}
        </SidebarContent>
      </Scrollbars>
    </Sidebar>
  );
};

function omitFromString(partToOmit: string, str: string): string {
  return str.startsWith(partToOmit + ':') ? str.split(':').slice(1, str.split(':').length).join('') : str;
}

const ButtonResetAll = styled(Button)`
  color: #333;
  height: 2.25rem;
  width: 100%;

  span {
    display: inline-block;
    width: 100%;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  width: ${(p) => p.theme.layout.sidebarWidth}rem;
  top: ${(p) => p.theme.layout.appbarHeight}rem;
  font-size: 0.875rem;
  padding-top: 6px;
`;

const SidebarContent = styled.div`
  margin-top: 0.25rem;
  width: 14rem;
  padding-left: 0.25rem;
`;

export const SidebarSectionWrapper = styled.div`
  margin: 0 0 1rem;
`;

export default HomeSidebar;
