import React, { useState } from 'react';

import InformationRow from '../../components/InformationRow';
import PropertyTable from '../../components/PropertyTable';
import { Run } from '../../types';
import styled from 'styled-components';
import { getISOString } from '../../utils/date';
import Icon from '../../components/Icon';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../../utils/format';
import StatusField from '../../components/Status';

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
              layout="dark"
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
            <TagRow run={run} />
          </InformationRow>

          {expanded && (
            <InformationRow>
              <ParametersTitleRow>
                <LabelText>{t('run.parameters') + ':'}</LabelText>
              </ParametersTitleRow>
              <PropertyTable
                layout="bright"
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
        <ExpandLink onClick={() => setExpanded(!expanded)}>
          <span>{expanded ? t('run.hide-run-details') : t('run.show-run-details')}</span>
          <Icon size="lg" name="arrowDown" rotate={expanded ? 180 : 0} />
        </ExpandLink>
      </ShowDetailsRow>
    </RunHeaderContainer>
  );
};

const RunHeaderContainer = styled.div`
  position: relative;
`;

const ShowDetailsRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ExpandLink = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 0.5rem;
  color: ${(p) => p.theme.color.text.blue};
  cursor: pointer;

  span {
    margin: 0 1rem;
  }
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

//
// Tag row
//
const TagRow: React.FC<{ run: Run }> = ({ run }) => {
  return (
    <StyledTagRow>
      <TagRowLabel>Tags</TagRowLabel>
      <TagRowContent>
        {mergeTags(run).map((tag) => (
          <TagItem key={tag}>{tag}</TagItem>
        ))}
      </TagRowContent>
    </StyledTagRow>
  );
};

const StyledTagRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  color: ${({ theme }) => theme.color.text.mid};
`;

const TagRowLabel = styled.div`
  font-size: 12px;
  padding: 0 15px;
`;

const TagRowContent = styled.div`
  display: flex;
  flex: 1;
`;

const TagItem = styled.div`
  background: #fff;
  padding: 5px 10px;
  margin: 0 3px;
  font-size: 14px;
  box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.43);
  border-radius: 4px;
`;

export default RunHeader;
