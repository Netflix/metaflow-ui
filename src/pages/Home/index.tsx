import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Run as IRun, QueryParam } from '../../types';
import useResource from '../../hooks/useResource';

import { fromPairs } from '../../utils/object';
import { pluck } from '../../utils/array';
import { parseOrderParam, directionFromText, swapDirection } from '../../utils/url';
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
import { useQueryParams, StringParam, withDefault } from 'use-query-params';
import useIsInViewport from 'use-is-in-viewport';

interface DefaultQuery {
  _group: 'string';
  _order: 'string';
  _limit: 'string';
}

const defaultParams = {
  _group: 'flow_id',
  _order: '-ts_epoch',
  _limit: '6',
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
  return param ? param.split(',').filter((p: string) => p !== '') : [];
}

const Home: React.FC = () => {
  const [qp, setQp] = useQueryParams({
    _group: withDefault(StringParam, 'flow_id'),
    _order: withDefault(StringParam, '-ts_epoch'),
    _limit: withDefault(StringParam, '6'),
    _tags: StringParam,
    status: withDefault(StringParam, 'running,completed,failed'),
    flow_id: StringParam,
  });

  const history = useHistory();
  const handleParamChange = (key: string, value: string) => {
    setQp({ [key]: value });
  };
  const getQueryParam: (props: string) => string = (prop: string) => (qp as any)[prop] || (defaultParams as any)[prop];
  const getDefaultedQueryParam = (prop: keyof DefaultQuery) => getQueryParam(prop) as string;
  const getAllDefaultedQueryParams = () => ({
    ...defaultParams,
    ...cleanParams(qp as any),
  });
  const activeParams = getAllDefaultedQueryParams();

  const resetAllFilters = useCallback(() => {
    setQp({ ...defaultParams, _group: activeParams._group }, 'replace');
  }, [setQp, activeParams]);

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
    if (Object.keys(cleanParams(activeParams)).length === 0) {
      resetAllFilters();
    }
  }, [activeParams, resetAllFilters]);

  useEffect(() => {
    if (isDefaultParams(activeParams)) {
      resetAllFilters();
    }
  }, []); // eslint-disable-line

  const [runGroups, setRunGroups] = useState<Record<string, IRun[]>>({});

  useEffect(() => {
    setRunGroups(
      runs
        ? fromPairs<IRun[]>(
            pluck(groupField, runs).map((val) => [val as string, runs.filter((r) => r[groupField] === val)]),
          )
        : {},
    );
  }, [runs]); // eslint-disable-line

  return (
    <>
      <HomeSidebar
        getQueryParam={getQueryParam}
        getDefaultedQueryParam={getDefaultedQueryParam}
        handleParamChange={handleParamChange}
        updateListValue={updateListValue}
        params={activeParams}
        resetAllFilters={resetAllFilters}
      />

      <MemoContentArea
        error={error}
        status={status}
        params={cleanParams(qp as any)}
        runGroups={runGroups}
        handleOrderChange={handleOrderChange}
        handleRunClick={handleRunClick}
      />
    </>
  );
};

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

const HomeSidebar: React.FC<{
  getQueryParam: (key: string) => string;
  getDefaultedQueryParam: (key: keyof DefaultQuery) => string;
  handleParamChange: (key: string, value: string) => void;
  updateListValue: (key: string, value: string) => void;
  params: Record<string, string>;
  resetAllFilters: () => void;
}> = ({ getQueryParam, getDefaultedQueryParam, handleParamChange, updateListValue, params, resetAllFilters }) => {
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

        <TagParameterList paramKey="flow_id" updateList={updateListValue} value={getQueryParam('flow_id')} />
      </Section>

      <Section>
        <TagInput onSubmit={(v) => updateListValue('_tags', `project:${v}`)} sectionLabel={t('fields.project')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => x.startsWith('project:')).map((x) => x.substr('project:'.length))}
          mapValue={(x) => `project:${x}`}
          updateList={updateListValue}
          value={getQueryParam('_tags')}
        />
      </Section>

      <Section>
        <TagInput onSubmit={(v) => updateListValue('_tags', `user:${v}`)} sectionLabel={t('fields.user')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => x.startsWith('user:')).map((x) => x.substr('user:'.length))}
          mapValue={(x) => `user:${x}`}
          updateList={updateListValue}
          value={getQueryParam('_tags')}
        />
      </Section>

      <Section>
        <TagInput onSubmit={(v) => updateListValue('_tags', v)} sectionLabel={t('fields.tag')} />

        <TagParameterList
          paramKey="_tags"
          mapList={(xs) => xs.filter((x) => !/^user:|project:/.test(x))}
          updateList={updateListValue}
          value={getQueryParam('_tags')}
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

const HomeContentArea: React.FC<{
  error: Error | null;
  status: 'Ok' | 'Error' | 'Loading' | 'NotAsked';
  runGroups: Record<string, IRun[]>;
  params: Record<string, string>;
  handleOrderChange: (orderProps: string) => void;
  handleRunClick: (r: IRun) => void;
}> = ({ error, status, runGroups, handleOrderChange, handleRunClick, params }) => {
  const [visibleAmount, setVisibleAmount] = useState(5);
  const { t } = useTranslation();
  const resultAmount = Object.keys(runGroups).length;

  useEffect(() => {
    setVisibleAmount(5);
  }, [params._group, params.status, params.flow_id, params._tags]);

  return (
    <Content>
      {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}
      {status === 'Loading' && (
        <Section style={{ position: 'absolute', left: '50%', background: '#fff' }}>
          <Spinner />
        </Section>
      )}

      {status === 'Ok' && resultAmount === 0 && <Section>{t('home.no-results')}</Section>}

      {resultAmount > 0 &&
        Object.keys(runGroups)
          .sort()
          .slice(0, visibleAmount)
          .map((k) => {
            return (
              <ResultGroup
                key={k}
                field={params._group ? params._group : 'flow_id'}
                fieldValue={k}
                initialData={runGroups[k]}
                queryParams={params}
                onOrderChange={handleOrderChange}
                onRunClick={handleRunClick}
                resourceUrl="/runs"
              />
            );
          })}
      <AutoLoadTrigger
        updateVisibility={() => {
          if (totalLengthOfRuns(runGroups) > visibleAmount) {
            setVisibleAmount(visibleAmount + 5);
          }
        }}
      />
    </Content>
  );
};

function totalLengthOfRuns(grouppedRuns: Record<string, IRun[]>) {
  return Object.keys(grouppedRuns).reduce((amount, key) => {
    return amount + grouppedRuns[key].length;
  }, 0);
}

const AutoLoadTrigger: React.FC<{ updateVisibility: () => void }> = ({ updateVisibility }) => {
  const [isInViewport, targetRef] = useIsInViewport();
  const [isUpdatable, setIsUpdatable] = useState(false);

  useEffect(() => {
    if (isInViewport && isUpdatable) {
      updateVisibility();
      setIsUpdatable(false);

      setTimeout(() => {
        setIsUpdatable(true);
      }, 250);
    }
  }, [isInViewport, updateVisibility, isUpdatable]);

  useEffect(() => {
    setTimeout(() => {
      setIsUpdatable(true);
    }, 500);
  }, []);

  return <div ref={targetRef} />;
};

const MemoContentArea = React.memo<{
  error: Error | null;
  status: 'Ok' | 'Error' | 'Loading' | 'NotAsked';
  runGroups: Record<string, IRun[]>;
  params: Record<string, string>;
  handleOrderChange: (orderProps: string) => void;
  handleRunClick: (r: IRun) => void;
}>((props) => {
  return <HomeContentArea {...props} />;
});

function cleanParams(qp: Record<string, string>): Record<string, string> {
  return Object.keys(qp).reduce((obj, key) => {
    const value = (qp as any)[key];
    if (value) {
      return { ...obj, [key]: value };
    }
    return obj;
  }, {});
}

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
