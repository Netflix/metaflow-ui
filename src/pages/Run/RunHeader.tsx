import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Run, RunParam, APIError, AsyncStatus } from '../../types';

import StatusField from '../../components/Status';
import InformationRow from '../../components/InformationRow';
import PropertyTable from '../../components/PropertyTable';
import { Link, useHistory } from 'react-router-dom';
import { APIErrorRenderer } from '../../components/GenericError';

import {
  getRunDuration,
  getRunEndTime,
  getRunId,
  getRunStartTime,
  getRunSystemTag,
  getUsername,
} from '../../utils/run';
import ShowDetailsButton from '../../components/ShowDetailsButton';
import { TimezoneContext } from '../../components/TimezoneProvider';
import TagRow from './components/TagRow';
import TitledRow from '../../components/TitledRow';

//
// Typedef
//

type Props = {
  run: Run;
  parameters: RunParam | null;
  status: AsyncStatus;
  error: APIError | null;
};

//
// Component
//

const RunHeader: React.FC<Props> = ({ run, parameters, status, error }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { timezone } = useContext(TimezoneContext);
  const [expanded, setExpanded] = useState(false);

  const parameterTableItems = (parameters ? Object.entries(parameters) : []).reduce((obj, param) => {
    const [param_name, param_props] = param;
    return { ...obj, [param_name]: param_props.value };
  }, {});

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
      accessor: (item: Run) => getRunSystemTag(item, 'project'),
      hidden: !getRunSystemTag(run, 'project'),
    },
    {
      label: t('fields.language'),
      accessor: (item: Run) => getRunSystemTag(item, 'language'),
      hidden: !getRunSystemTag(run, 'language'),
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

        <TitledRow
          title={t('run.parameters')}
          {...(status !== 'Ok' || Object.keys(parameterTableItems).length === 0
            ? {
                type: 'default',
                content:
                  status === 'Error' && error ? (
                    <APIErrorRenderer error={error} message={t('run.run-parameters-error')} />
                  ) : (
                    t('run.no-parameters')
                  ),
              }
            : {
                type: 'table',
                content: parameterTableItems,
              })}
        />

        {expanded && (
          <>
            <TagRow label={t('run.tags')} tags={run.tags || []} push={history.push} noTagsMsg={t('run.no-tags')} />

            <TagRow
              label={t('run.system-tags')}
              tags={run.system_tags || []}
              push={history.push}
              noTagsMsg={t('run.no-system-tags')}
            />
          </>
        )}
      </div>

      <ShowDetailsButton
        toggle={() => setExpanded(!expanded)}
        visible={expanded}
        showText={t('run.show-run-details')}
        hideText={t('run.hide-run-details')}
      />
    </RunHeaderContainer>
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
