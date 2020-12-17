import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Run, RunParam, APIError } from '../../types';

import { ItemRow } from '../../components/Structure';
import StatusField from '../../components/Status';
import InformationRow from '../../components/InformationRow';
import PropertyTable from '../../components/PropertyTable';
import { Link, useHistory } from 'react-router-dom';
import { ResourceStatus } from '../../hooks/useResource';
import { APIErrorRenderer } from '../../components/GenericError';
import Spinner from '../../components/Spinner';
import {
  getRunDuration,
  getRunEndTime,
  getRunId,
  getRunStartTime,
  getRunSystemTag,
  getUsername,
} from '../../utils/run';
import ParameterTable from '../../components/ParameterTable';
import ShowDetailsButton from '../../components/ShowDetailsButton';
import { TimezoneContext } from '../../components/TimezoneProvider';
import TagRow from './components/TagRow';

//
// Typedef
//

type Props = {
  run: Run;
  parameters: RunParam | null;
  status: ResourceStatus;
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
        <Link to={`/?real_user=${encodeURIComponent(item.real_user)}`}>{getUsername(item)}</Link>
      ),
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
        {(run.tags || []).length > 0 && <TagRow label={t('run.tags')} tags={run.tags || []} push={history.push} />}

        {expanded && (
          <>
            <TagRow label={t('run.system-tags')} tags={run.system_tags || []} push={history.push} />

            <InformationRow>
              {status === 'Loading' && (
                <ItemRow margin="lg" justify="center">
                  <Spinner sm />
                </ItemRow>
              )}

              {status === 'Ok' && parameterTableItems && (
                <ParameterTable
                  label={t('run.parameters')}
                  items={parameterTableItems}
                  errorLabel={t('run.no-run-parameters')}
                />
              )}

              {status === 'Error' && error && (
                <div style={{ margin: '1rem 0' }}>
                  <APIErrorRenderer error={error} message={t('run.run-parameters-error')} icon={false} />
                </div>
              )}
            </InformationRow>
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

export default RunHeader;
