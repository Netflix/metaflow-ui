import React from 'react';
import styled from 'styled-components';

//
// Typedef
//

type Props =
  | {
      title?: string;
      type: 'default';
      content: React.ReactNode;
    }
  | { title?: string; type: 'table'; content: { [key: string]: React.ReactNode } };

//
// Component
// TitledRow has 2 modes, table and default. Table modes has default handling for content where as default just render what
// ever is given as content prop
//

const TitledRow: React.FC<Props> = (props) => {
  return (
    <StyledTitledRow data-testid="titled-row">
      {props.title && <TitledRowTitle data-testid="titled-row-title">{props.title}</TitledRowTitle>}
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

/**
 * Turn any value to renderable ReactChild. Also make sure that some values like boolean or
 * JSON objects looks better than by default stringify
 * @param value Pretty much any value
 */
export function valueToRenderableType(
  value: React.ReactNode | Record<string, unknown>,
  forceFormat?: boolean,
): React.ReactChild {
  if (React.isValidElement(value)) return value;

  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  } else if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'string') {
    try {
      const val = JSON.parse(value);
      if (typeof val === 'object') {
        return <code>{JSON.stringify(val, null, 2)}</code>;
      }
      return value;
    } catch {
      return value;
    }
  }

  try {
    const stringified = JSON.stringify(value, null, Array.isArray(value) && !forceFormat ? undefined : 2);
    return <code>{stringified}</code>;
  } catch (e) {
    return '';
  }
}

//
// Styles
//

const StyledTitledRow = styled.div`
  margin: var(--titled-row-margin);
`;

const TitledRowTitle = styled.div`
  font-weight: var(--titled-row-head-font-weight);
  font-size: var(--titled-row-head-font-size);
  margin: var(--titled-row-head-margin);
  color: var(--titled-row-head-text-color);
`;

const ContentBackground = styled.div`
  background: var(--titled-row-bg);
  border-radius: var(--titled-row-border-radius);
  font-size: var(--titled-row-font-size);
  color: var(--titled-row-text-color);
`;

const ContentSection = styled.div`
  padding: var(--titled-row-padding);
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
