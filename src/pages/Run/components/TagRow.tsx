import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ItemRow } from '../../../components/Structure';
import TitledRow from '../../../components/TitledRow';

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
                <RunTag key={tag} to={'/?_tags=' + encodeURIComponent(tag)}>
                  {tag}
                  {index !== tags.length - 1 && ', '}
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

const RunTag = styled(Link)`
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default TagRow;
