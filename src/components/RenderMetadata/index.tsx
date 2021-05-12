import React from 'react';
import styled from 'styled-components';
import { Metadata } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';

type Props = {
  metadata: Metadata[];
};

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

const TemplateSlot = styled.div`
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);

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
    background: #333;
    color: #fff;
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
    font-size: 0.875rem;
    padding: 0.4rem 1rem;
    font-weight: 400;
    text-align: left;
  }

  th:first-child {
    border-top-left-radius: 0.25rem;
  }

  th:last-child {
    border-top-right-radius: 0.25rem;
  }

  td {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
    background: rgba(0, 0, 0, 0.03);
  }
`;

export default RenderMetadata;
