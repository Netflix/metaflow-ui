import React from 'react';
import styled from 'styled-components';
import { Metadata } from '@/types';
import MarkdownRenderer from '@components/MarkdownRenderer';

type Props = {
  metadata: Metadata[];
};

//
// Rendering custom metadata as markdown.
//

const RenderMetadata: React.FC<Props> = ({ metadata }) => {
  return (
    <div>
      {metadata.map((uc, index) => (
        <TemplateSlot key={index}>
          <MarkdownRenderer content={uc.value} />
        </TemplateSlot>
      ))}
    </div>
  );
};

//
// Style
//

const TemplateSlot = styled.div`
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  border-bottom: var(--border-thin-1);

  &:last-child {
    margin-bottom: 0;
  }

  table {
    overflow-x: auto;
    border-spacing: 0px;
    border-collapse: collapse;
    width: 100%;
  }

  th {
    background: var(--metadata-table-header-bg);
    color: var(--metadata-table-header-text);
    border-right: 2px solid var(--metadata-table-cell-border);
    border-bottom: 2px solid var(--metadata-table-cell-border);
    font-size: var(--font-size-primary);
    padding: 0.4rem 1rem;
    font-weight: 400;
    text-align: left;
  }

  th:first-child {
    border-top-left-radius: var(--radius-primary);
  }

  th:last-child {
    border-top-right-radius: var(--radius-primary);
  }

  td {
    padding: 0.75rem 1rem;
    font-size: var(--font-size-primary);
    border-right: 2px solid var(--metadata-table-cell-border);
    border-bottom: 2px solid var(--metadata-table-cell-border);
    background: var(--metadata-table-cell-bg);
  }
`;

export default RenderMetadata;
