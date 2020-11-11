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
          {(run.tags || []).length > 0 && <TagRow label={t('run.tags')} tags={run.tags || []} push={history.push} />}

          {expanded && (
            <>
              <TagRow label={t('run.system-tags')} tags={run.system_tags || []} push={history.push} />

              <InformationRow>
                {status === 'Loading' && (
                  <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <Spinner sm />
                  </div>
                )}

                {status === 'Ok' && parameterTableItems && parameterTableColumns && (
                  <>
                    {Object.keys(parameterTableItems[0]).length === 0 && (
                      <ItemRow margin="md">
                        <GenericError noIcon message={t('run.no-run-parameters')} />
                      </ItemRow>
                    )}

                    {Object.keys(parameterTableItems[0]).length > 0 && (
                      <PropertyTable scheme="bright" items={parameterTableItems} columns={parameterTableColumns} />
                    )}
                  </>
                )}

                {status === 'Error' && error && (
                  <ItemRow margin="lg">
                    <GenericError message={t('run.run-parameters-error')} />
                  </ItemRow>
                )}
              </InformationRow>
            </>
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

type TagRowProps = {
  tags: string[];
  label: string;
  push: (path: string) => void;
};

const TagRow: React.FC<TagRowProps> = ({ tags, label, push }) => (
  <InformationRow scrollOverflow={false}>
    <ItemRow pad="md" style={{ paddingLeft: '0.25rem' }}>
      <SmallText>{label}</SmallText>
      <ItemRow pad="xs" style={{ flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <TagNoWrap
            key={tag}
            onClick={() => {
              push('/?_tags=' + encodeURIComponent(tag));
            }}
          >
            {tag}
          </TagNoWrap>
        ))}
      </ItemRow>
    </ItemRow>
  </InformationRow>
);

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

const TagNoWrap = styled(Tag)<{ dark?: boolean }>`
  white-space: nowrap;

  .icon {
    margin-left: ${(p) => p.theme.spacer.xs}rem;
  }
`;

export default RunHeader;
