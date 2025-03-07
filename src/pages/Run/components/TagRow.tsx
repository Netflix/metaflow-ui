import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ItemRow } from '@components/Structure';
import TitledRow from '@components/TitledRow';

//
// Typedef
//

type TagRowProps = {
  tags: string[];
  label: string;
  push: (path: string) => void;
  noTagsMsg: string;
};

//
// Component
//

const TagRow: React.FC<TagRowProps> = ({ tags, label, noTagsMsg }) => {
  return (
    <TitledRow
      title={label}
      type="default"
      content={
        <ItemRow pad="xs" style={{ flexWrap: 'wrap', width: 'auto' }}>
          {tags.length > 0
            ? tags.map((tag, index) => (
                <RunTag key={tag} last={index === tags.length - 1}>
                  <TagContent to={'/?_tags=' + encodeURIComponent(tag)}>{tag}</TagContent>
                </RunTag>
              ))
            : noTagsMsg}
        </ItemRow>
      }
    />
  );
};

//
// Style
//

const RunTag = styled.div<{ last: boolean }>`
  display: flex;
  &:after {
    content: ${(p) => (p.last ? "''" : 'var(--run-tag-divider)')};
  }
`;

const TagContent = styled(Link)`
  cursor: pointer;
  font-size: var(--run-tag-font-size);
  font-weight: var(--run-tag-font-weight);
  color: var(--run-tag-text-color);
  background: var(--run-tag-bg);
  border: var(--run-tag-border);
  border-radius: var(--run-tag-border-radius);
  padding: var(--run-tag-padding);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default TagRow;
