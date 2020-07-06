import React, { useEffect, useState, useCallback } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { Run as IRun } from '../../types';
import useQuery from '../../hooks/useQuery';
import useResource from '../../hooks/useResource';

import { getISOString } from '../../utils/date';
import { fromPairs } from '../../utils/object';
import { getParamChangeHandler } from '../../utils/url';

import { RemovableTag } from '../../components/Tag';
import Table, { HeaderColumn, TR, TD } from '../../components/Table';
import { CheckboxField, SelectField } from '../../components/Form';
import { Layout, Sidebar, Section, SectionHeader, SectionHeaderContent, Content } from '../../components/Structure';
import Notification, { NotificationType } from '../../components/Notification';
import TagInput from '../../components/TagInput';
import Icon from '../../components/Icon';

import { ResultGroup, StatusColorCell, StatusColorHeaderCell } from './styles';
import { getPath } from '../../utils/routing';
import { useTranslation } from 'react-i18next';

type QueryParam = string | null;

interface DefaultQuery {
  _group: 'string';
  _order: 'string';
  _limit: 'string';
}

const defaultQuery = new URLSearchParams({
  _group: 'flow_id',
  _order: '+run_number',
  _limit: '5',
  status: 'running,completed,failed',
});

const strExists = (p: string) => p !== '';
function paramList(param: QueryParam): Array<string> {
  return param !== null ? param.split(',').filter(strExists) : [];
}

interface StatusFieldProps {
  value: string;
  label: string;
}

type GroupPaginationValueProps = {
  page: string;
  pages: { self: string; last: string };
  prop: string;
  propVal: string;
  data: IRun[];
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const query = useQuery();
  const history = useHistory();
  const location = useLocation();

  const [groupPages, setGroupPages] = useState<Record<string, GroupPaginationValueProps>>({});

  const search = useCallback((qs: string) => history.push(`${location.pathname}?${qs}`), [history, location.pathname]);

  const handleParamChange = getParamChangeHandler(query, search, () => setGroupPages({}));

  const getQueryParam = (prop: string) => query.get(prop) || defaultQuery.get(prop);

  const getDefaultedQueryParam = (prop: keyof DefaultQuery) => getQueryParam(prop) as string;

  const parseOrderParam = (val: string): [string, string] => [val.substr(0, 1), val.substr(1)];

  const resetAllFilters = useCallback(() => {
    setGroupPages({});
    search(defaultQuery.toString());
  }, [search]);

  const handleRunClick = (r: IRun) => history.push(getPath.dag(r.flow_id, r.run_number));

  const handleOrderChange = (value: string) => {
    let nextDir = '+';
    const [dir, val] = parseOrderParam(getDefaultedQueryParam('_order'));
    if (val === value) nextDir = dir === '+' ? '-' : '+';
    const nextOrder = `${nextDir}${value}`;
    handleParamChange('_order', nextOrder, false);

    // refetch reordered items that were loaded via load more
    const gp = [...Object.entries(groupPages)];
    const limit = getDefaultedQueryParam('_limit');

    Promise.all(
      gp.map(([, v]) =>
        fetch(`/api/runs?${v.prop}=${v.propVal}&_order=${nextOrder}&_limit=${Number(limit) * Number(v.page)}`)
          .then((r) => r.json())
          .then((b) => ({ ...v, data: b.data })),
      ),
    ).then((bs) => {
      const kv = bs.reduce<Record<string, GroupPaginationValueProps>>(
        (acc, cur) => ({ ...acc, [cur.propVal]: cur }),
        {},
      );
      setGroupPages(fromPairs<GroupPaginationValueProps>(Object.entries(kv)));
    });
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

  const loadMoreRuns = (val: string, page = '1') => {
    const prop = getDefaultedQueryParam('_group');
    const order = getDefaultedQueryParam('_order');

    fetch(`/api/runs?${prop}=${val}&_order=${order}&_limit=5&_page=${page}`)
      .then((res) => res.json())
      .then(({ pages, data, links }) => {
        const commonProps = { page, pages, links, prop, propVal: val };
        setGroupPages((obj) => ({
          ...obj,
          [val]: val in obj ? { ...commonProps, data: obj[val].data.concat(data) } : { ...commonProps, data },
        }));
      });
  };

  const { data: runs, error } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: '/runs',
    queryParams: { ...fromPairs([...defaultQuery.entries()]), ...fromPairs([...query.entries()]) },
  });

  useEffect(() => {
    if (!query.toString()) {
      resetAllFilters();
    }
  }, [query, resetAllFilters]);

  const runsGroupedByProperty: Record<string, IRun[]> = Object.entries(
    runs.reduce((acc: Record<string, IRun[]>, cur: IRun) => {
      const groupKey: keyof DefaultQuery = '_group';
      const key: keyof IRun = getDefaultedQueryParam(groupKey);
      const val = cur[key];
      if (typeof val === 'string' || typeof val === 'number') {
        return { ...acc, [val]: val in acc ? acc[val].concat(cur) : [cur] };
      }
      return acc;
    }, {}),
  )
    .map(([key, val]) => {
      const paginated = groupPages[key]?.data;
      const keys = new Set(val.map((r) => r.run_number).concat((paginated || []).map((r) => r.run_number)));
      const _runs = [...keys.values()]
        .map((k) => val.find((r) => r.run_number === k) || groupPages[key].data.find((r) => r.run_number === k))
        .filter((r) => !!r) as IRun[];
      return [key, _runs] as [string, IRun[]];
    })
    .reduce((acc: Record<string, IRun[]>, cur) => {
      return { ...acc, [cur[0]]: cur[1] };
    }, {});

  const LocalTH = (props: { label: string; queryKey: string }) => (
    <HeaderColumn
      {...props}
      queryKey={props.queryKey}
      onSort={handleOrderChange}
      currentOrder={getDefaultedQueryParam('_order')}
    />
  );

  const StatusField: React.FC<StatusFieldProps> = ({ value, label }) => {
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
        <RemovableTag key={i} onClick={() => updateListValue(paramKey, mapValue(x))}>
          {x}
        </RemovableTag>
      ))}
    </>
  );

  return (
    <Layout>
      <Sidebar className="sidebar">
        <Section>
          <SectionHeader>
            {t('filters.group-by')}
            <SectionHeaderContent align="right">
              <SelectField
                horizontal
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
          <SectionHeader>Status</SectionHeader>
          <StatusField label={t('filters.running')} value="running" />
          <StatusField label={t('filters.failed')} value="failed" />
          <StatusField label={t('filters.completed')} value="completed" />
        </Section>

        <Section>
          <SectionHeader>
            {t('fields.user')}
            <SectionHeaderContent align="right">
              <TagInput onSubmit={(v) => updateListValue('_tags', `user:${v}`)} />
            </SectionHeaderContent>
          </SectionHeader>
          <TagParameterList
            paramKey="_tags"
            mapList={(xs) => xs.filter((x) => x.startsWith('user:')).map((x) => x.substr('user:'.length))}
            mapValue={(x) => `user:${x}`}
          />
        </Section>

        <Section>
          <SectionHeader>
            {t('fields.flow')}
            <SectionHeaderContent align="right">
              <TagInput onSubmit={(v) => updateListValue('flow_id', v)} />
            </SectionHeaderContent>
          </SectionHeader>
          <TagParameterList paramKey="flow_id" />
        </Section>

        <Section>
          <SectionHeader>
            {t('fields.tag')}
            <SectionHeaderContent align="right">
              <TagInput onSubmit={(v) => updateListValue('_tags', v)} />
            </SectionHeaderContent>
          </SectionHeader>
          <TagParameterList paramKey="_tags" mapList={(xs) => xs.filter((x) => !/^user:|project:/.test(x))} />
        </Section>

        <Section>
          <SectionHeader>
            {t('fields.project')}
            <SectionHeaderContent align="right">
              <TagInput onSubmit={(v) => updateListValue('_tags', `project:${v}`)} />
            </SectionHeaderContent>
          </SectionHeader>
          <TagParameterList
            paramKey="_tags"
            mapList={(xs) => xs.filter((x) => x.startsWith('project:')).map((x) => x.substr('project:'.length))}
            mapValue={(x) => `project:${x}`}
          />
        </Section>

        <button onClick={() => resetAllFilters()}>
          <Icon name="times" /> {t('filters.reset-all')}
        </button>
      </Sidebar>

      <Content>
        {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}
        {(!runs || !runs.length) && (
          <Section>
            <h3>{t('no-results')}</h3>
            <p>Possible tips listed here</p>
          </Section>
        )}
        {!!runs &&
          !!runs.length &&
          Object.keys(runsGroupedByProperty).map((k) => (
            <ResultGroup key={k}>
              <h3>{k}</h3>

              <Table cellPadding="0" cellSpacing="0">
                <thead>
                  <TR>
                    <StatusColorHeaderCell />
                    <LocalTH label={t('fields.id')} queryKey="run_number" />
                    <LocalTH label={t('fields.status')} queryKey="status" />
                    <LocalTH label={t('fields.started-at')} queryKey="ts_epoch" />
                    <LocalTH label={t('fields.finished-at')} queryKey="finished_at" />
                    <LocalTH label={t('fields.duration')} queryKey="duration" />
                    <LocalTH label={t('fields.user')} queryKey="user_name" />
                  </TR>
                </thead>
                <tbody>
                  {runsGroupedByProperty[k].map((r) => (
                    <TR key={r.run_number} onClick={() => handleRunClick(r)}>
                      <StatusColorCell status={r.status} />
                      <TD>
                        <span className="muted">#</span> <strong>{r.run_number}</strong>
                      </TD>
                      <TD>{r.status}</TD>
                      <TD>{getISOString(new Date(r.ts_epoch))}</TD>
                      <TD>{!!r.finished_at ? getISOString(new Date(r.finished_at)) : false}</TD>
                      <TD>{r.duration}</TD>
                      <TD>{r.user_name}</TD>
                      <TD className="timeline-link">
                        <Link
                          to={getPath.run(r.flow_id, r.run_number)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            history.push(getPath.run(r.flow_id, r.run_number));
                          }}
                        >
                          <Icon name="timeline" size="lg" /> Timeline
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
              {(groupPages[k]?.pages.last !== groupPages[k]?.pages.self ||
                (!groupPages[k] && runsGroupedByProperty[k].length >= Number(getDefaultedQueryParam('_limit')))) && (
                <>
                  <small
                    className="load-more"
                    onClick={() =>
                      loadMoreRuns(k, !!groupPages[k]?.page ? String(Number(groupPages[k].page) + 1) : '2')
                    }
                  >
                    {t('home.load-more-runs')} <Icon name="arrowDown" size="sm" />
                  </small>
                </>
              )}
            </ResultGroup>
          ))}
      </Content>
    </Layout>
  );
};

export default Home;
