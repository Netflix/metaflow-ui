import React from 'react';
import styled from 'styled-components';
import { RemovableTag } from '../../../components/Tag';
import { paramList } from '../Home.utils';

//
// Tag list
//

type TagParameterListProps = {
  paramKey: string;
  mapList?: (xs: string[]) => string[];
  mapValue?: (x: string) => string;
  updateList: (key: string, value: string) => void;
  value?: string;
};

export const TagParameterList: React.FC<TagParameterListProps> = ({
  paramKey,
  mapList = (xs) => xs,
  mapValue = (x) => x,
  updateList,
  value,
}) => (
  <ParameterList>
    {value
      ? mapList(paramList(value)).map((x, i) => (
          <StyledRemovableTag key={i} onClick={() => updateList(paramKey, mapValue(x))}>
            {x}
          </StyledRemovableTag>
        ))
      : null}
  </ParameterList>
);

//
// Style
//

export const ParameterList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.5rem;
`;

export const StyledRemovableTag = styled(RemovableTag)`
  align-items: center;
  min-height 2rem;
  margin-top: ${(p) => p.theme.spacer.sm}rem;
  word-break: break-all;
  margin-right: ${(p) => p.theme.spacer.sm}rem;
`;
