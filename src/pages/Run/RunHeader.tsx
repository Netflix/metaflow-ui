import React, { useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Artifact, Run, RunParam } from '../../types';

import StatusField from '../../components/Status';
import { Link, useHistory } from 'react-router-dom';

import { getRunDuration, getRunEndTime, getRunId, getRunStartTime, getTagOfType, getUsername } from '../../utils/run';
import { TimezoneContext } from '../../components/TimezoneProvider';
import TagRow from './components/TagRow';

import Collapsable from '../../components/Collapsable';
import RunParameterTable from './RunParameterTable';
import PluginGroup from '../../components/Plugins/PluginGroup';
import AutoUpdating from '../../components/AutoUpdating';
import DataHeader from '../../components/DataHeader';
import RunWarning from './components/RunWarning';
import useResource from '../../hooks/useResource';
import Triggers from '../../components/Triggers';
import TitledRow from '../../components/TitledRow';
import { getISOString } from '../../utils/date';
import { TriggerEventsValue } from '../../components/Trigger';
import { PluginsContext } from '../../components/Plugins/PluginManager';

//
// Typedef
//

type Props = {
  run: Run;
  metadataRecord?: Record<string, string>;
};

const emptyObj = {};
const emptyArray: Artifact[] = [];
const initialQueryParams = {
  ds_type: 'local',
  _limit: '1',
};

//
// Component
//

const RunHeader: React.FC<Props> = ({ run, metadataRecord }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { timezone } = useContext(TimezoneContext);
  const { getPluginsBySlot } = useContext(PluginsContext);
  const hasPlugins = getPluginsBySlot('run-header').length > 0;

  const headerItems = [
    { label: t('fields.run-id'), value: getRunId(run) },
    { label: t('fields.status'), value: <StatusField status={run.status} /> },
    {
      label: t('fields.triggered-by'),
      value: metadataRecord?.['execution-triggers'] ? (
        <TriggersInHeader triggerEventsValue={JSON.parse(metadataRecord?.['execution-triggers'])} />
      ) : null,
      hidden: !Boolean(metadataRecord?.['execution-triggers']),
    },
    {
      label: t('fields.user'),
      value: <StyledLink to={`/?user=${encodeURIComponent(run.user || 'null')}`}>{getUsername(run)}</StyledLink>,
      hidden: !getUsername(run),
    },
    {
      label: t('fields.project'),
      value: <ProjectField run={run} />,
      hidden: !getTagOfType(run.system_tags, 'project'),
    },
    {
      label: t('fields.language'),
      value: getTagOfType(run.system_tags, 'language'),
      hidden: !getTagOfType(run.system_tags, 'language'),
    },
    { label: t('fields.started-at'), value: getRunStartTime(run, timezone) },
    { label: t('fields.finished-at'), value: getRunEndTime(run, timezone) },
    {
      label: t('fields.duration'),
      value: <AutoUpdating enabled={run.status === 'running'} content={() => getRunDuration(run)} />,
    },
  ];

  const params = useResource<RunParam, RunParam>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/parameters`,
    subscribeToEvents: true,
    initialData: emptyObj,
  });

  const dstype = useResource<Artifact[], Artifact>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/artifacts`,
    queryParams: initialQueryParams,
    subscribeToEvents: true,
    initialData: emptyArray,
  });

  let triggerEventsData: TriggerEventsValue[] = metadataRecord?.['execution-triggers']
    ? JSON.parse(metadataRecord?.['execution-triggers'])
    : [];

  triggerEventsData = triggerEventsData.map((triggerEvent) => {
    return {
      ...triggerEvent,
      timestamp: getISOString(new Date(Number(triggerEvent.timestamp) * 1000), timezone),
    };
  });

  return (
    <RunHeaderContainer>
      <DataHeader items={headerItems} wide />
      <RunWarning run={run} usesLocalDataStore={(dstype.data && dstype.data.length > 0) || false} />

      <Collapsable title={t('run.run-details') ?? ''}>
        <>
          <RunParameterTable params={params} />

          {triggerEventsData.map((triggerEvent: TriggerEventsValue) => (
            <TitledRow
              title={t('run.triggering-event') ?? ''}
              type="table"
              content={triggerEvent}
              key={triggerEvent.id ?? triggerEvent.name}
            />
          ))}

          <TagRow label={t('run.tags')} tags={run.tags || []} push={history.push} noTagsMsg={t('run.no-tags')} />

          <TagRow
            label={t('run.system-tags')}
            tags={run.system_tags || []}
            push={history.push}
            noTagsMsg={t('run.no-system-tags')}
          />
          <PluginWrapper active={hasPlugins}>
            <PluginGroup id={getRunId(run)} title="Extensions" slot="run-header" />
          </PluginWrapper>
        </>
      </Collapsable>
    </RunHeaderContainer>
  );
};

const ProjectField: React.FC<{ run: Run }> = ({ run }) => {
  const project = getTagOfType(run.system_tags, 'project');
  const projectBranch = getTagOfType(run.system_tags, 'project_branch');

  if (!project) return null;

  return (
    <div>
      <StyledLink to={`/?_tags=project:${project}`}>{project}</StyledLink>
      {projectBranch && ' / '}
      {projectBranch && (
        <StyledLink
          to={
            project
              ? `/?_tags=project:${project},project_branch:${projectBranch}`
              : `/?_tags=project_branch:${projectBranch}`
          }
        >
          {projectBranch}
        </StyledLink>
      )}
    </div>
  );
};

//
// Style
//

const RunHeaderContainer = styled.div`
  position: relative;
`;

const StyledLink = styled(Link)`
  color: var(--data-header-link-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const PluginWrapper = styled.div<{ active: boolean }>`
  margin-top: ${(p) => (p.active ? '1rem' : '0')};
`;

const TriggersInHeader = styled(Triggers)`
  a {
    color: var(--data-header-link-color);
  }
`;

export default RunHeader;
