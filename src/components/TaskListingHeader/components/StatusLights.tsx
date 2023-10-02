import React from 'react';
import styled from 'styled-components';
import StatusIndicator from '../../StatusIndicator';

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
        <StatusBox status="pending" />
        <StatusBox status="failed" />
      </>
    )}
    {status === 'completed' && <StatusBox status="completed" />}
    {status === 'failed' && <StatusBox status="failed" />}
    {status === 'running' && <StatusBox status="running" />}
    {status === 'pending' && <StatusBox status="pending" />}
    {status === 'unknown' && <StatusBox status="unknown" />}
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

const StatusBox = styled(StatusIndicator)`
  margin: 0 1px;
`;

export default StatusLights;
