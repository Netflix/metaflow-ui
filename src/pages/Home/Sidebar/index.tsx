import React, { useContext } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { isDefaultParams } from '@pages/Home/Home.utils';
import SidebarStatusSelection from '@pages/Home/Sidebar/SidebarStatusSelection';
import { TagParameterList } from '@pages/Home/Sidebar/SidebarTags';
import SidebarTimerangeSelection from '@pages/Home/Sidebar/SidebarTimerangeSelection';
import Button from '@components/Button';
import FilterInput from '@components/FilterInput';
import DropdownField from '@components/Form/Dropdown';
import { Text } from '@components/Text';
import { TimezoneContext } from '@components/TimezoneProvider';
import FEATURE_FLAGS from '@utils/FEATURE';
import { getHeaderSizeRem } from '@utils/style';

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

const HomeSidebar: React.FC<Props> = ({ handleParamChange, updateListValue, params, resetAllFilters }) => {
  const { t } = useTranslation();
  const { timezone } = useContext(TimezoneContext);

  return (
    <Sidebar className="sidebar">
      {/* Add sidebar size to be 100% viewheight - (header size + 1 rem for padding) */}
      <StyledScrollbars autoHide>
        <SidebarContent>
          {FEATURE_FLAGS.RUN_GROUPS && (
            <SidebarSectionWrapper>
              <DropdownField
                label={t('filters.group-by') ?? ''}
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

          {!isDefaultParams(params, true, timezone) && (
            <div>
              <ButtonResetAll
                size="sm"
                onClick={() => resetAllFilters()}
                disabled={isDefaultParams(params, true, timezone)}
              >
                <Text>{t('filters.reset-all')}</Text>
              </ButtonResetAll>
            </div>
          )}
        </SidebarContent>
      </StyledScrollbars>
    </Sidebar>
  );
};

//
// Utils
//

function omitFromString(partToOmit: string, str: string): string {
  return str.startsWith(partToOmit + ':') ? str.split(':').slice(1, str.split(':').length).join('') : str;
}

//
// Styles
//

const ButtonResetAll = styled(Button)`
  color: var(--reset-button-color);
  border-color: var(--reset-button-border-color);
  height: var(--reset-button-height);
  font-weight: var(--reset-button-font-weight);
  width: 100%;

  span {
    display: inline-block;
    width: 100%;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  width: var(--sidebar-width-md);
  @media (max-width: var(--layout-breakpoint-sm)) {
    width: var(--sidebar-width-sm);
  }
  top: var(--layout-application-bar-height);
  font-size: var(--font-size-primary);
  padding-top: 6px;
`;

const SidebarContent = styled.div`
  width: var(--sidebar-width-md);
  @media (max-width: var(--layout-breakpoint-sm)) {
    width: var(--sidebar-width-sm);
  }
  padding-top: 0.5rem;
  padding-left: 0.25rem;
`;

const StyledScrollbars = styled(Scrollbars)`
  height: calc(100vh - ${getHeaderSizeRem() + 1}rem) !important;
  width: calc(var(--sidebar-width-md) + 1rem) !important;
  @media (max-width: var(--layout-breakpoint-sm)) {
    width: calc(var(--sidebar-width-sm) + 1rem) !important;
  }
  padding-top: 0.25rem;
`;

export const SidebarSectionWrapper = styled.div`
  margin: var(--sidebar-section-margin);
`;

export default HomeSidebar;
