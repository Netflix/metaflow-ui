import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Run, RunParam, APIError } from '../../types';

import { getISOString } from '../../utils/date';
import { formatDuration } from '../../utils/format';

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

  const parameterTableItems = [
    (parameters ? Object.entries(parameters) : []).reduce((obj, param) => {
      const [param_name, param_props] = param;
      return { ...obj, [param_name]: param_props.value };
    }, {}),
  ];

  const parameterTableColumns = [
    {
      label: t('run.parameters'),
      accessor: (params: Record<string, string>) => (
        <table>
          <tbody>
            {Object.keys(params).map((key) => (
              <tr key={key}>
                <ParameterKey>{key}</ParameterKey>
                <ParameterValue>{params[key]}</ParameterValue>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
  ];

  return (
    <RunHeaderContainer>
      {(!run || !run.run_number) && <InformationRow>{t('run.no-run-data')}</InformationRow>}
      {run && run.run_number && (
        <div>
          <InformationRow spaceless>
            <PropertyTable
              scheme="dark"
              items={[run]}
              columns={[
                { label: t('fields.run-id') + ':', prop: 'run_number' as const },
                { label: t('fields.status') + ':', accessor: (item) => <StatusField status={item.status} /> },
                {
                  label: t('fields.user') + ':',
                  accessor: (item) => (
                    <Link to={`/?_tags=user:${encodeURIComponent(item.user_name)}`}>{item.user_name}</Link>
                  ),
                },
                { label: t('fields.project') + ':', prop: '?' },
                { label: t('fields.language') + ':', prop: '?' },
                { label: t('fields.started-at') + ':', accessor: (item) => getISOString(new Date(item.ts_epoch)) },
                {
                  label: t('fields.finished-at') + ':',
                  accessor: (item) => (item.finished_at ? getISOString(new Date(item.finished_at)) : ''),
                },
                {
                  label: t('fields.duration') + ':',
                  accessor: (item) => (item.finished_at ? formatDuration(item.finished_at - item.ts_epoch, 0) : ''),
                },
              ]}
            />
          </InformationRow>
          <InformationRow scrollOverflow={false}>
            <ItemRow pad="md" style={{ paddingLeft: '0.25rem' }}>
              <SmallText>{t('run.tags')}</SmallText>
              <ItemRow pad="xs" style={{ flexWrap: 'wrap' }}>
                {mergeTags(run).map((tag) => (
                  <TagNoWrap
                    key={tag}
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
                  highlighted
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

              {status === 'Ok' && parameterTableItems && parameterTableColumns && (
                <PropertyTable scheme="bright" items={parameterTableItems} columns={parameterTableColumns} />
              )}

              {status === 'Error' && error && (
                <ItemRow margin="lg">
                  <GenericError message={t('run.no-run-parameters')} />
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

const ParameterKey = styled.td`
  padding-right: ${(p) => p.theme.spacer.hg}rem;
  color: ${(p) => p.theme.color.text.mid};
`;
const ParameterValue = styled.td`
  color: ${(p) => p.theme.color.text.dark};
`;

const TagNoWrap = styled(Tag)`
  white-space: nowrap;
  padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.sm}rem;

  .icon {
    margin-left: ${(p) => p.theme.spacer.xs}rem;
  }
`;

export default RunHeader;
