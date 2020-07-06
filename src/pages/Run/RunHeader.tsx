import React, { useState } from 'react';

import InformationRow from '../../components/InformationRow';
import PropertyTable from '../../components/PropertyTable';
import { Run } from '../../types';
import styled from 'styled-components';
import { getISOString } from '../../utils/date';
import Icon from '../../components/Icon';

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

const RunHeader: React.FC<{ run?: Run }> = ({ run }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <RunHeaderContainer>
      {(!run || !run.run_number) && <InformationRow>No run data</InformationRow>}

      {run && run.run_number && (
        <div>
          <InformationRow spaceless>
            <PropertyTable
              items={[
                { label: 'Run id:', content: run.run_number },
                { label: 'Status:', content: run.status },
                { label: 'User:', content: run.user_name },
                { label: 'Project:', content: '?' },
                { label: 'Language:', content: '?' },
                { label: 'Started at:', content: getISOString(new Date(run.ts_epoch)) },
                { label: 'Finished at:', content: run.finished_at ? getISOString(new Date(run.finished_at)) : '' },
                { label: 'Duration:', content: run.finished_at ? formatDuration(run.finished_at - run.ts_epoch) : '' },
              ]}
            />
          </InformationRow>
          <InformationRow>
            <TagRow run={run} />
          </InformationRow>

          {expanded && (
            <InformationRow>
              <ExpandLink onClick={() => setExpanded(!expanded)}>
                <span>Hide run details</span>
                <Icon size="lg" name="arrowDown" rotate={180} />
              </ExpandLink>
            </InformationRow>
          )}
        </div>
      )}

      {!expanded && (
        <ShowDetailsRow>
          <ExpandLink onClick={() => setExpanded(!expanded)}>
            <span>Show all run details</span>
            <Icon size="lg" name="arrowDown" />
          </ExpandLink>
        </ShowDetailsRow>
      )}
    </RunHeaderContainer>
  );
};

const RunHeaderContainer = styled.div`
  position: relative;
  margin: 0 0 15px 0;
`;

const ShowDetailsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: 0;
`;

const ExpandLink = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 10px;
  color: #146ee6;
  cursor: pointer;

  span {
    margin: 0 15px;
  }
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
