import React from 'react';
import styled from 'styled-components';
import { StatusColorIndicator } from '../../Status';

//
// Typedef
//

type Props = { status: string };

//
// Component
//

const StatusLights: React.FC<Props> = ({ status }) => (
  <StatusLightsContainer>
    {status === 'all' && (
      <>
        <StatusBox status="completed" />
        <StatusBox status="running" />
        <StatusBox status="failed" />
      </>
    )}
    {status === 'completed' && <StatusBox status="completed" />}
    {status === 'failed' && <StatusBox status="failed" />}
    {status === 'running' && <StatusBox status="running" />}
  </StatusLightsContainer>
);

//
// Style
//

const StatusLightsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
`;

const StatusBox = styled(StatusColorIndicator)`
  margin: 0 1px;
`;

export default StatusLights;
