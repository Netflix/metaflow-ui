import React, { useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Run } from '../../types';

import StatusField from '../../components/Status';
import InformationRow from '../../components/InformationRow';
import PropertyTable from '../../components/PropertyTable';
import { Link, useHistory } from 'react-router-dom';

import { getRunDuration, getRunEndTime, getRunId, getRunStartTime, getTagOfType, getUsername } from '../../utils/run';
import { TimezoneContext } from '../../components/TimezoneProvider';
import TagRow from './components/TagRow';

import Collapsable from '../../components/Collapsable';
import RunParameterTable from './RunParameterTable';

//
// Typedef
//

type Props = {
  run: Run;
};

//
// Component
//

const RunHeader: React.FC<Props> = ({ run }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { timezone } = useContext(TimezoneContext);

  const columns = [
    { label: t('fields.run-id'), accessor: (item: Run) => getRunId(item) },
    { label: t('fields.status'), accessor: (item: Run) => <StatusField status={item.status} /> },
    {
      label: t('fields.user'),
      accessor: (item: Run) => (
        <StyledLink to={`/?user=${encodeURIComponent(item.user || 'null')}`}>{getUsername(item)}</StyledLink>
      ),
      hidden: !getUsername(run),
    },
    {
      label: t('fields.project'),
      accessor: (item: Run) => <ProjectField run={item} />,
      hidden: !getTagOfType(run.system_tags, 'project'),
    },
    {
      label: t('fields.language'),
      accessor: (item: Run) => getTagOfType(item.system_tags, 'language'),
      hidden: !getTagOfType(run.system_tags, 'language'),
    },
    { label: t('fields.started-at'), accessor: (r: Run) => getRunStartTime(r, timezone) },
    { label: t('fields.finished-at'), accessor: (r: Run) => getRunEndTime(r, timezone) },
    { label: t('fields.duration'), accessor: getRunDuration },
  ].filter((col) => !col.hidden);

  return (
    <RunHeaderContainer>
      <div>
        <InformationRow spaceless>
          <PropertyTable scheme="dark" items={[run]} columns={columns} />
        </InformationRow>
      </div>
      <RunParameterTable run={run} />

      <Collapsable title={t('run.run-details')}>
        <>
          <TagRow label={t('run.tags')} tags={run.tags || []} push={history.push} noTagsMsg={t('run.no-tags')} />

          <TagRow
            label={t('run.system-tags')}
            tags={run.system_tags || []}
            push={history.push}
            noTagsMsg={t('run.no-system-tags')}
          />
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
      {projectBranch && <StyledLink to={`/?_tags=project_branch:${projectBranch}`}>{projectBranch}</StyledLink>}
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
  color: ${(p) => p.theme.color.text.dark};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default RunHeader;
