import React from 'react';
import styled from 'styled-components';
import { valueToRenderableType } from '../../../components/TitledRow';
import { HEADER_SIZE_REM } from '../../../constants';

type Props = {
  data: string;
  height: number;
};

const ArtifactViewer: React.FC<Props> = ({ data, height }) => {
  return <ArtifactViewerContainer height={height}>{valueToRenderableType(data, true)}</ArtifactViewerContainer>;
};

const ArtifactViewerContainer = styled.div<{ height: number }>`
  width: 100%;
  height: ${(p) => p.height}px;
  min-height: calc(100vh - ${HEADER_SIZE_REM}rem);
  overflow-y: auto;
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.03);
  padding: 1rem;
`;

export default ArtifactViewer;
