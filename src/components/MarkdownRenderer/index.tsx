import React from 'react';
import styled from 'styled-components';
import Markdown from 'markdown-to-jsx';
import LaunchIconBlack from '../../assets/launch_black.svg';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
  <MarkdownContainer>
    <Markdown
      className="markdown"
      options={{
        overrides: {
          a: {
            component: MarkdownLink,
            props: {
              target: '_blank',
            },
          },
        },
      }}
    >
      {content}
    </Markdown>
  </MarkdownContainer>
);

export default MarkdownRenderer;

const MarkdownContainer = styled.div`
  max-width: 100%;
  overflow-x: auto;

  .markdown {
    white-space: pre-wrap;
  }
`;

const MarkdownLink = styled.a`
  color: inherit;
  margin: 0 0 0 0.25rem;

  &::after {
    content: url(${LaunchIconBlack});
    display: inline-block;
    margin: 0 0 0 0.25rem;
    position: relative;
    top: 0.25rem;
  }
`;
