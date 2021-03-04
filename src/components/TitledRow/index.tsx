import React from 'react';
import styled from 'styled-components';
import { readParameterValue } from '../../utils/parameters';

type Props =
  | {
      title: string;
      type: 'default';
      content: React.ReactNode;
    }
  | { title: string; type: 'table'; content: { [key: string]: React.ReactNode } };

const TitledRow: React.FC<Props> = (props) => {
  return (
    <StyledTitledRow data-testid="titled-row">
      <TitledRowTitle data-testid="titled-row-title">{props.title}</TitledRowTitle>
      <ContentBackground>
        {props.type === 'table' ? (
          Object.keys(props.content).map((key, index) => (
            <Row data-testid={`titled-row-row-${key.toLowerCase()}-${index}`} key={key}>
              <ContentSection data-testid="titledrow-row-title">{key}</ContentSection>
              <ContentSection data-testid="titledrow-row-value">
                {valueToRenderableType(props.content[key])}
              </ContentSection>
            </Row>
          ))
        ) : (
          <ContentSection data-testid="titled-row-default-mode">{props.content}</ContentSection>
        )}
      </ContentBackground>
    </StyledTitledRow>
  );
};

//
// Utils
//

export function valueToRenderableType(value: React.ReactNode): React.ReactChild {
  if (React.isValidElement(value)) return value;

  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  } else if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'string') {
    return readParameterValue(value);
  }
  try {
    const stringified = JSON.stringify(value, null, 2);
    return stringified;
  } catch (e) {
    return '';
  }
}

//
// Styles
//

const StyledTitledRow = styled.div`
  margin: 1rem 0 0.5rem 0;
`;

const TitledRowTitle = styled.div`
  font-weight: 500;
  margin: 0.5rem 0;
`;

const ContentBackground = styled.div`
  background: ${(p) => p.theme.color.bg.light};
  border-radius: 4px;
  font-size: 0.875rem;
`;

const ContentSection = styled.div`
  padding: 0.5rem 1rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

const Row = styled.div`
  display: flex;

  &:not(:last-child) {
    border-bottom: 2px solid #fff;
  }

  div:first-child {
    width: 200px;
    min-width: 200px;
    border-right: 2px solid #fff;
  }
`;

export default TitledRow;
