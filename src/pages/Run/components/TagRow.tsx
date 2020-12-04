import React from 'react';
import styled from 'styled-components';
import InformationRow from '../../../components/InformationRow';
import { ItemRow } from '../../../components/Structure';
import Tag from '../../../components/Tag';
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
      <TagRowTitlte>
        <SmallText>{label}</SmallText>
      </TagRowTitlte>
      <ItemRow pad="xs" style={{ flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <TagNoWrap
            key={tag}
            onClick={() => {
              push('/?_tags=' + encodeURIComponent(tag));
            }}
          >
            {tag}
          </TagNoWrap>
        ))}
      </ItemRow>
    </ItemRow>
  </InformationRow>
);

//
// Style
//

const TagNoWrap = styled(Tag)`
  white-space: nowrap;

  .icon {
    margin-left: ${(p) => p.theme.spacer.xs}rem;
  }
`;

const TagRowTitlte = styled.div`
  width: 120px;
`;

export default TagRow;
