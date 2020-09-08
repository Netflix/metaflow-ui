import React from 'react';
import { CheckboxField, SelectField } from '../../../components/Form';

import { paramList, isDefaultParams } from '../index';
import { useTranslation } from 'react-i18next';
import { Section, SectionHeader, SectionHeaderContent } from '../../../components/Structure';
import TagInput from '../../../components/TagInput';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import { Text } from '../../../components/Text';
import styled from 'styled-components';
import { RemovableTag } from '../../../components/Tag';

const TagParameterList: React.FC<{
  paramKey: string;
  mapList?: (xs: string[]) => string[];
  mapValue?: (x: string) => string;
  updateList: (key: string, value: string) => void;
  value?: string;
}> = ({ paramKey, mapList = (xs) => xs, mapValue = (x) => x, updateList, value }) => (
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

const StatusCheckboxField: React.FC<{
  value: string;
  label: string;
  updateField: (key: string, value: string) => void;
  activeStatus?: string | null;
}> = ({ value, label, updateField, activeStatus }) => {
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

const HomeSidebar: React.FC<{
  handleParamChange: (key: string, value: string) => void;
  updateListValue: (key: string, value: string) => void;
  params: Record<string, string>;
  resetAllFilters: () => void;
}> = ({ handleParamChange, updateListValue, params, resetAllFilters }) => {
  const { t } = useTranslation();

  return (
    <Sidebar className="sidebar">
      <Section>
        <SectionHeader>
          <div style={{ flexShrink: 0, paddingRight: '0.5rem' }}>{t('filters.group-by')}</div>
          <SectionHeaderContent align="right">
            <SelectField
              horizontal
              noMinWidth
              value={params._group}
              onChange={(e) => e && handleParamChange('_group', e.target.value)}
              options={[
                ['', t('fields.none')],
                ['flow_id', t('fields.flow')],
                ['user_name', t('fields.user')],
              ]}
            />
          </SectionHeaderContent>
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
        <TagInput onSubmit={(v) => updateListValue('flow_id', v)} sectionLabel={t('fields.flow')} />

        <TagParameterList paramKey="flow_id" updateList={updateListValue} value={params.flow_id} />
      </Section>

      <Section>
        <TagInput onSubmit={(v) => updateListValue('_tags', `project:${v}`)} sectionLabel={t('fields.project')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => x.startsWith('project:')).map((x) => x.substr('project:'.length))}
          mapValue={(x) => `project:${x}`}
          updateList={updateListValue}
          value={params._tags}
        />
      </Section>

      <Section>
        <TagInput onSubmit={(v) => updateListValue('_tags', `user:${v}`)} sectionLabel={t('fields.user')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => x.startsWith('user:')).map((x) => x.substr('user:'.length))}
          mapValue={(x) => `user:${x}`}
          updateList={updateListValue}
          value={params._tags}
        />
      </Section>

      <Section>
        <TagInput onSubmit={(v) => updateListValue('_tags', v)} sectionLabel={t('fields.tag')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => !/^user:|project:/.test(x))}
          updateList={updateListValue}
          value={params._tags}
        />
      </Section>

      <Section>
        <Button onClick={() => resetAllFilters()} disabled={isDefaultParams(params)}>
          <Icon name="times" padRight />
          <Text>{t('filters.reset-all')}</Text>
        </Button>
      </Section>
    </Sidebar>
  );
};

const StyledRemovableTag = styled(RemovableTag)`
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
