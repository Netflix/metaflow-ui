import React from 'react';
import styled from 'styled-components';
import Tooltip from '@/components/Tooltip';
import Icon from '@components/Icon';
import { TD } from '@components/Table';

//
// Typedef
//

type ResultGroupTagsProps = {
  id: string;
  tags: string[];
  updateListValue: (key: string, value: string) => void;
};

//
// Component
//

const ResultGroupTags: React.FC<ResultGroupTagsProps> = ({ id, tags, updateListValue }) => {
  const sortedTags = tags.sort((a, b) => a.localeCompare(b));
  const tooltipId = `tag-tooltip-${id}`;

  return (
    <TagsCell
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <TagContainer>
        {sortedTags.slice(0, 1).map((tag) => (
          <Tag key={tag} onClick={() => updateListValue('_tags', tag)}>
            {tag}
          </Tag>
        ))}

        {sortedTags.length > 1 && (
          <Tag data-tip data-for={tooltipId}>
            +{sortedTags.length - 1}
          </Tag>
        )}
      </TagContainer>

      <TagContainerSmallScreen data-tip data-for={tooltipId}>
        <Icon name="tag" size="sm" />
      </TagContainerSmallScreen>
      <Tooltip id={tooltipId} place="bottom">
        {sortedTags.map((tag, index) => (
          <>
            <TagInTooltip key={tag} onClick={() => updateListValue('_tags', tag)}>
              {tag}
            </TagInTooltip>
            {index !== sortedTags.length - 1 && ', '}
          </>
        ))}
      </Tooltip>
    </TagsCell>
  );
};

//
// Styles
//

const TagsCell = styled(TD)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: var(--color-text-primary);
  position: relative;
  line-height: 1.25rem;

  span:hover {
    text-decoration: underline;
  }

  &:hover {
    z-index: 9;
  }
`;

const TagContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: nowrap;

  @media only screen and (max-width: 1440px) {
    display: none;
  }
`;

const TagContainerSmallScreen = styled.div`
  display: none;
  @media only screen and (max-width: 1440px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Tag = styled.span`
  background: #6a68671a;
  padding: 0.25rem 0.5rem;
  color: #6a6867;
  border-radius: 0.75rem;
`;

const TagInTooltip = styled.span`
  cursor: pointer;
`;
export default ResultGroupTags;
