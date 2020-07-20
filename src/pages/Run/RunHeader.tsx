import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Run } from '../../types';

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

function mergeTags(run: Run) {
  const baseTags = run.tags || [];
  const sysTags = run.system_tags || [];

  return [...baseTags, ...sysTags];
}

const RunHeader: React.FC<{ run?: Run | null }> = ({ run }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

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
                { label: t('fields.user') + ':', prop: 'user_name' },
                { label: t('fields.project') + ':', prop: '?' },
                { label: t('fields.language') + ':', prop: '?' },
                { label: t('fields.started-at') + ':', accessor: (item) => getISOString(new Date(item.ts_epoch)) },
                {
                  label: t('fields.finished-at') + ':',
                  accessor: (item) => (item.finished_at ? getISOString(new Date(item.finished_at)) : ''),
                },
                {
                  label: t('fields.duration') + ':',
                  accessor: (item) => (item.finished_at ? formatDuration(item.finished_at - item.ts_epoch) : ''),
                },
              ]}
            />
          </InformationRow>
          <InformationRow>
            <ItemRow pad="md">
              <SmallText>Tags</SmallText>
              <ItemRow pad="xs">
                {mergeTags(run).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </ItemRow>
            </ItemRow>
          </InformationRow>

          {expanded && (
            <InformationRow>
              <ParametersTitleRow>
                <LabelText>{t('run.parameters') + ':'}</LabelText>
              </ParametersTitleRow>
              <PropertyTable
                scheme="bright"
                items={[{ a: 1, b: 2, c: 3 }]}
                columns={[
                  { label: 'A:', prop: 'a' },
                  { label: 'B:', prop: 'b' },
                  { label: 'C:', prop: 'c' },
                ]}
              />
            </InformationRow>
          )}
        </div>
      )}

      <ShowDetailsRow>
        <Button onClick={() => setExpanded(!expanded)} textOnly variant="primaryText" size="sm">
          {expanded ? t('run.hide-run-details') : t('run.show-run-details')}
          <Icon size="sm" name="arrowDown" rotate={expanded ? 180 : 0} padLeft />
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

const LabelText = styled.div`
  color: ${(p) => p.theme.color.text.mid};
  font-size: 12px;
`;

const ParametersTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default RunHeader;
