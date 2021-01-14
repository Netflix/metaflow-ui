import React from 'react';
import styled from 'styled-components';
import InformationRow from '../../../components/InformationRow';
import { ItemRow } from '../../../components/Structure';
// import Tag from '../../../components/Tag';
import { SmallText } from '../../../components/Text';

//
// Typedef
//

type TagRowProps = {
  tags: string[];
  label: string;
  push: (path: string) => void;
};

//
// Component
//

const TagRow: React.FC<TagRowProps> = ({ tags, label, push }) => (
  <InformationRow scrollOverflow={false}>
    <ItemRow pad="md" style={{ paddingLeft: '0.25rem' }}>
      <TagRowTitle>
        <SmallText>{label}</SmallText>
      </TagRowTitle>
      <ItemRow pad="xs" style={{ flexWrap: 'wrap' }}>
        {tags.map((tag, index) => (
          <RunTag
            key={tag}
            onClick={() => {
              push('/?_tags=' + encodeURIComponent(tag));
            }}
          >
            {tag}
            {index !== tags.length - 1 && ', '}
          </RunTag>
        ))}
      </ItemRow>
    </ItemRow>
  </InformationRow>
);

//
// Style
//

const TagRowTitle = styled.div`
  width: 120px;
`;

const RunTag = styled.span`
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`;

export default TagRow;
