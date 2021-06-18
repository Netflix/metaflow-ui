import React from 'react';
import styled from 'styled-components';
import InformationRow from '../../../components/InformationRow';
import { valueToRenderableType } from '../../../components/TitledRow';

type Props = {
  data: string;
  height: number;
};

const ArtifactViewer: React.FC<Props> = ({ data, height }) => {
  return (
    <ArtifactViewerContainer height={height}>
      <InformationRow>{valueToRenderableType(data)}</InformationRow>
    </ArtifactViewerContainer>
  );
};

const ArtifactViewerContainer = styled.div<{ height: number }>`
  height: ${(p) => p.height}px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

export default ArtifactViewer;
