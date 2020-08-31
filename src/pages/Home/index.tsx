import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Run as IRun, QueryParam } from '../../types';
import useQuery from '../../hooks/useQuery';
import useResource from '../../hooks/useResource';

import { fromPairs } from '../../utils/object';
import { pluck } from '../../utils/array';
import { getParamChangeHandler, parseOrderParam, directionFromText, swapDirection } from '../../utils/url';
import { getPath } from '../../utils/routing';

import { RemovableTag } from '../../components/Tag';
import { CheckboxField, SelectField } from '../../components/Form';
import { Section, SectionHeader, SectionHeaderContent } from '../../components/Structure';
import Notification, { NotificationType } from '../../components/Notification';
import TagInput from '../../components/TagInput';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { Text } from '../../components/Text';
import Spinner from '../../components/Spinner';
import ResultGroup from './ResultGroup';

interface DefaultQuery {
  _group: 'string';
  _order: 'string';
  _limit: 'string';
}

const defaultParams = {
  _group: 'flow_id',
  _order: '-run_number',
  _limit: '10',
  status: 'running,completed,failed',
};

export const defaultQuery = new URLSearchParams(defaultParams);

function isDefaultParams(params: Record<string, string>) {
  if (Object.keys(params).length === 4) {
    if (
      params._order === defaultParams._order &&
      params._limit === defaultParams._limit &&
      params.status === defaultParams.status
    ) {
      return true;
    }
  }
  return false;
}

function paramList(param: QueryParam): Array<string> {
  return param !== null ? param.split(',').filter((p: string) => p !== '') : [];
}

// TODO: most of the query related functionality could be exposed by the useQuery hook

const Home: React.FC = () => {
  const { t } = useTranslation();
  const query = useQuery();
  const history = useHistory();
  const location = useLocation();

  const search = useCallback((qs: string) => history.push(`${location.pathname}?${qs}`), [history, location.pathname]);
  const handleParamChange = getParamChangeHandler(query, search);
  const getQueryParam = (prop: string) => query.get(prop) || defaultQuery.get(prop);
  const getDefaultedQueryParam = (prop: keyof DefaultQuery) => getQueryParam(prop) as string;
  const getAllDefaultedQueryParams = () => ({
    ...fromPairs<string>([...defaultQuery.entries()]),
    ...fromPairs<string>([...query.entries()]),
  });
  const activeParams = getAllDefaultedQueryParams();

  const resetAllFilters = useCallback(() => {
    const newQ = new URLSearchParams({ ...defaultParams, _group: activeParams._group });
    search(newQ.toString());
  }, [search, activeParams._group]);
  const handleRunClick = (r: IRun) => history.push(getPath.dag(r.flow_id, r.run_number));

  const handleOrderChange = (orderProp: string) => {
    const [currentDirection, currentOrderProp] = parseOrderParam(getDefaultedQueryParam('_order'));
    const nextOrder = `${directionFromText(currentDirection)}${orderProp}`;
    handleParamChange('_order', currentOrderProp === orderProp ? swapDirection(nextOrder) : nextOrder);
  };

  const updateListValue = (key: string, val: string) => {
    const vals = new Set(paramList(getQueryParam(key)));

    if (!vals.has(val)) {
      vals.add(val);
    } else {
      vals.delete(val);
    }

    handleParamChange(key, [...vals.values()].join(','));
  };

  const groupField: keyof IRun = getDefaultedQueryParam('_group');

  const { data: runs, error, status } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: true,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: activeParams,
  });

  useEffect(() => {
    if (!query.toString()) {
      resetAllFilters();
    }
  }, [query, resetAllFilters]);

  const runsGroupedByProperty = runs
    ? fromPairs<IRun[]>(
        pluck(groupField, runs).map((val) => [val as string, runs.filter((r) => r[groupField] === val)]),
      )
    : {};

  const StatusCheckboxField: React.FC<{ value: string; label: string }> = ({ value, label }) => {
    const checked = new Set(paramList(getQueryParam('status'))).has(value);
    return (
      <CheckboxField
        label={label}
        className={`status-${value}`}
        checked={checked}
        onChange={() => updateListValue('status', value)}
      />
    );
  };

  const TagParameterList: React.FC<{
    paramKey: string;
    mapList?: (xs: string[]) => string[];
    mapValue?: (x: string) => string;
  }> = ({ paramKey, mapList = (xs) => xs, mapValue = (x) => x }) => (
    <>
      {mapList(paramList(getQueryParam(paramKey))).map((x, i) => (
        <StyledRemovableTag key={i} onClick={() => updateListValue(paramKey, mapValue(x))}>
          {x}
        </StyledRemovableTag>
      ))}
    </>
  );

  return (
    <>
      <Sidebar className="sidebar">
        <Section>
          <SectionHeader>
            <div style={{ flexShrink: 0, paddingRight: '0.5rem' }}>{t('filters.group-by')}</div>
            <SectionHeaderContent align="right">
              <SelectField
                horizontal
                noMinWidth
                value={getDefaultedQueryParam('_group')}
                onChange={(e) => e && handleParamChange('_group', e.target.value)}
                options={[
                  ['flow_id', t('fields.flow')],
                  ['user_name', t('fields.user')],
                ]}
              />
            </SectionHeaderContent>
          </SectionHeader>
        </Section>

        <Section>
          <SectionHeader>{t('fields.status')}</SectionHeader>
          <StatusCheckboxField label={t('filters.running')} value="running" />
          <StatusCheckboxField label={t('filters.failed')} value="failed" />
          <StatusCheckboxField label={t('filters.completed')} value="completed" />
        </Section>

        <Section>
          <TagInput onSubmit={(v) => updateListValue('flow_id', v)} sectionLabel={t('fields.flow')} />

          <TagParameterList paramKey="flow_id" />
        </Section>

        <Section>
          <TagInput onSubmit={(v) => updateListValue('_tags', `project:${v}`)} sectionLabel={t('fields.project')} />

          <TagParameterList
            paramKey="_tags"
            mapList={(xs) => xs.filter((x) => x.startsWith('project:')).map((x) => x.substr('project:'.length))}
            mapValue={(x) => `project:${x}`}
          />
        </Section>

        <Section>
          <TagInput onSubmit={(v) => updateListValue('_tags', `user:${v}`)} sectionLabel={t('fields.user')} />

          <TagParameterList
            paramKey="_tags"
            mapList={(xs) => xs.filter((x) => x.startsWith('user:')).map((x) => x.substr('user:'.length))}
            mapValue={(x) => `user:${x}`}
          />
        </Section>

        <Section>
          <TagInput onSubmit={(v) => updateListValue('_tags', v)} sectionLabel={t('fields.tag')} />

          <TagParameterList paramKey="_tags" mapList={(xs) => xs.filter((x) => !/^user:|project:/.test(x))} />
        </Section>

        <Section>
          <Button onClick={() => resetAllFilters()} disabled={isDefaultParams(activeParams)}>
            <Icon name="times" padRight />
            <Text>{t('filters.reset-all')}</Text>
          </Button>
        </Section>
      </Sidebar>

      <Content>
        {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}
        {status === 'Loading' && (
          <Section>
            <Spinner />
          </Section>
        )}

        {status === 'Ok' && (!runs || runs.length === 0) && <Section>{t('home.no-results')}</Section>}

        {!!runs &&
          !!runs.length &&
          Object.keys(runsGroupedByProperty)
            .sort()
            .map((k) => {
              return (
                <ResultGroup
                  key={k}
                  field={getDefaultedQueryParam('_group')}
                  fieldValue={k}
                  initialData={runsGroupedByProperty[k]}
                  queryParams={activeParams}
                  onOrderChange={handleOrderChange}
                  onRunClick={handleRunClick}
                  resourceUrl="/runs"
                />
              );
            })}
      </Content>
    </>
  );
};

export default Home;

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

const Content = styled.div`
  margin-left: ${(p) => p.theme.layout.sidebarWidth + 1}rem;
  padding-top: ${(p) => p.theme.spacer.md}rem;

  h3:first-of-type {
    margin-top: 0;
  }
`;
