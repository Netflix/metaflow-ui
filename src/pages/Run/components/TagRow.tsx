import React from 'react';
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

const TagRow: React.FC<TagRowProps> = ({ tags, label, push, noTagsMsg }) => {
  return (
    <TitledRow
      title={label}
      type="default"
      content={
        <ItemRow pad="xs" style={{ flexWrap: 'wrap', width: 'auto' }}>
          {tags.length > 0
            ? tags.map((tag, index) => (
                <RunTag
                  key={tag}
                  onClick={() => {
                    push('/?_tags=' + encodeURIComponent(tag));
                  }}
                >
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

const RunTag = styled.span`
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`;

export default TagRow;
