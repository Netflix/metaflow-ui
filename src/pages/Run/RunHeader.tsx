import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Run, RunParam, APIError } from '../../types';

import { ItemRow } from '../../components/Structure';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import Tag from '../../components/Tag';
import { SmallText } from '../../components/Text';
import StatusField from '../../components/Status';
import InformationRow from '../../components/InformationRow';
import PropertyTable from '../../components/PropertyTable';
import { Link, useHistory } from 'react-router-dom';
import { ResourceStatus } from '../../hooks/useResource';
import GenericError from '../../components/GenericError';
import Spinner from '../../components/Spinner';
import { getRunDuration, getRunEndTime, getRunStartTime, getUsername } from '../../utils/run';
import ParameterTable from '../../components/ParameterTable';

function mergeTags(run: Run) {
  const baseTags = run.tags || [];
  const sysTags = run.system_tags || [];

  return [...baseTags, ...sysTags];
}

const RunHeader: React.FC<{
  run?: Run | null;
  parameters: RunParam | null;
  status: ResourceStatus;
  error: APIError | null;
}> = ({ run, parameters, status, error }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);

  const parameterTableItems = (parameters ? Object.entries(parameters) : []).reduce((obj, param) => {
    const [param_name, param_props] = param;
    return { ...obj, [param_name]: param_props.value };
  }, {});

  const columns = [
    { label: t('fields.run-id') + ':', prop: 'run_number' as const },
    { label: t('fields.status') + ':', accessor: (item: Run) => <StatusField status={item.status} /> },
    {
      label: t('fields.user') + ':',
      accessor: (item: Run) => (
        <Link to={`/?user_name=${encodeURIComponent(item.user_name)}`}>{getUsername(item)}</Link>
      ),
    },
    {
      label: t('fields.project') + ':',
      accessor: (item: Run) => item.system_tags.find((tag) => tag.startsWith('project:')),
      hidden: !run || !run.system_tags.find((tag) => tag.startsWith('project:')),
    },
    {
      label: t('fields.language') + ':',
      accessor: (item: Run) => item.system_tags.find((tag) => tag.startsWith('language:')),
      hidden: !run || !run.system_tags.find((tag) => tag.startsWith('project:')),
    },
    { label: t('fields.started-at') + ':', accessor: getRunStartTime },
    { label: t('fields.finished-at') + ':', accessor: getRunEndTime },
    { label: t('fields.duration') + ':', accessor: getRunDuration },
  ].filter((col) => !col.hidden);

  return (
    <RunHeaderContainer>
      {(!run || !run.run_number) && <InformationRow>{t('run.no-run-data')}</InformationRow>}
      {run && run.run_number && (
        <div>
          <InformationRow spaceless>
            <PropertyTable scheme="dark" items={[run]} columns={columns} />
          </InformationRow>
          <InformationRow scrollOverflow={false}>
            <ItemRow pad="md" style={{ paddingLeft: '0.25rem' }}>
              <SmallText>{t('run.tags')}</SmallText>
              <ItemRow pad="xs" style={{ flexWrap: 'wrap' }}>
                {run.system_tags.map((tag) => (
                  <TagNoWrap
                    key={tag}
                    onClick={() => {
                      history.push('/?_tags=' + encodeURIComponent(tag));
                    }}
                  >
                    {tag}
                  </TagNoWrap>
                ))}
                {(run.tags || []).map((tag) => (
                  <TagNoWrap
                    key={tag}
                    dark
                    onClick={() => {
                      history.push('/?_tags=' + encodeURIComponent(tag));
                    }}
                  >
                    {tag}
                  </TagNoWrap>
                ))}
                <TagNoWrap
                  onClick={() => {
                    history.push('/?_tags=' + encodeURIComponent(mergeTags(run).join(',')));
                  }}
                >
                  {t('run.select-all-tags')} <Icon name="plus" size="xs" />
                </TagNoWrap>
              </ItemRow>
            </ItemRow>
          </InformationRow>

          {expanded && (
            <InformationRow>
              {status === 'Loading' && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                  <Spinner sm />
                </div>
              )}

              {status === 'Ok' && parameterTableItems && (
                <ParameterTable
                  label={t('run.parameters')}
                  items={parameterTableItems}
                  errorLabel={t('run.no-run-parameters')}
                />
              )}

              {status === 'Error' && error && (
                <ItemRow margin="lg">
                  <GenericError message={t('run.run-parameters-error')} />
                </ItemRow>
              )}
            </InformationRow>
          )}
        </div>
      )}

      <ShowDetailsRow>
        <Button onClick={() => setExpanded(!expanded)} textOnly variant="primaryText" size="sm">
          {expanded ? t('run.hide-run-details') : t('run.show-run-details')}
          <Icon name="arrowDown" rotate={expanded ? 180 : 0} padLeft />
        </Button>
      </ShowDetailsRow>
    </RunHeaderContainer>
  );
};

const RunHeaderContainer = styled.div`
  position: relative;
`;

const ShowDetailsRow = styled.div`
  padding-top: ${(p) => p.theme.spacer.sm}rem;
  display: flex;
  justify-content: flex-end;
`;

const TagNoWrap = styled(Tag)<{ dark?: boolean }>`
  white-space: nowrap;

  .icon {
    margin-left: ${(p) => p.theme.spacer.xs}rem;
  }
`;

export default RunHeader;
