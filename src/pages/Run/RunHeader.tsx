import React, { useState } from 'react';

import InformationRow from '../../components/InformationRow';
import PropertyTable from '../../components/PropertyTable';
import { Run } from '../../types';
import styled from 'styled-components';
import { getISOString } from '../../utils/date';
import Icon from '../../components/Icon';
import { useTranslation } from 'react-i18next';

function mergeTags(run: Run) {
  const baseTags = run.tags || [];
  const sysTags = run.system_tags || [];

  return [...baseTags, ...sysTags];
}

function formatDuration(time: number) {
  const secs = time / 1000;
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs - hours * 3600) / 60);
  const seconds = secs - hours * 3600 - minutes * 60;

  let str = '';

  if (hours > 0) str += hours + 'h ';
  if (minutes > 0) str += minutes + 'm ';
  if (seconds > 0) str += seconds.toFixed(2) + 's';

  return str;
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
              items={[
                { label: t('fields.run-id') + ':', content: run.run_number },
                { label: t('fields.status') + ':', content: run.status },
                { label: t('fields.user') + ':', content: run.user_name },
                { label: t('fields.project') + ':', content: '?' },
                { label: t('fields.language') + ':', content: '?' },
                { label: t('fields.started-at') + ':', content: getISOString(new Date(run.ts_epoch)) },
                {
                  label: t('fields.finished-at') + ':',
                  content: run.finished_at ? getISOString(new Date(run.finished_at)) : '',
                },
                {
                  label: t('fields.duration') + ':',
                  content: run.finished_at ? formatDuration(run.finished_at - run.ts_epoch) : '',
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
                items={[
                  { label: 'A:', content: '1' },
                  { label: 'B:', content: '2' },
                  { label: 'C:', content: '3' },
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
