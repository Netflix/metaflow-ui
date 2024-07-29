import React, { useState } from 'react';
import styled from 'styled-components';
import { TD } from '../../../components/Table';

//
// Typedef
//

type ResultGroupTagsProps = {
  tags: string[];
  updateListValue: (key: string, value: string) => void;
};

//
// Component
//

const ResultGroupTags: React.FC<ResultGroupTagsProps> = ({ tags, updateListValue }) => {
  const [open, setOpen] = useState(false);

  const sortedTags = tags.sort((a, b) => a.localeCompare(b));

  return (
    <TagsCell
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <TagContainer>
        {sortedTags.slice(0, 3).map((tag, index) => (
          <span key={tag} onClick={() => updateListValue('_tags', tag)}>
            {tag}
            {index !== sortedTags.length - 1 && ', '}
          </span>
        ))}

        {sortedTags.length > 3 && !open && <span>...</span>}
      </TagContainer>

      {sortedTags.length > 3 && (
        <AllTagsContainer open={open} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          {(open ? sortedTags : sortedTags.slice(0, 3)).map((tag, index) => (
            <span key={tag} onClick={() => updateListValue('_tags', tag)}>
              {tag}
              {index !== sortedTags.length - 1 && ', '}
            </span>
          ))}
        </AllTagsContainer>
      )}
    </TagsCell>
  );
};

//
// Styles
//

const TagsCell = styled(TD)`
  color: ${(p) => p.theme.color.text.dark};
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
  position: relative;
`;

const AllTagsContainer = styled.div<{ open: boolean }>`
  position: absolute;
  top: 0;
  background: #e4f0ff;

  width: 100%;
  left: 0;
  padding: 0.5rem 1rem;
  border-bottom: ${(p) => p.theme.border.thinNormal};
  transition: 0.15s all;
  overflow: hidden;

  opacity: ${(p) => (p.open ? '1' : '0')};
`;

export default ResultGroupTags;
