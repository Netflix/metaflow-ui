import React from 'react';
import styled from 'styled-components';
import { APIError, AsyncStatus } from '@/types';
import { APIErrorRenderer } from '@components/GenericError';
import Spinner from '@components/Spinner';

//
// Conditional renderer for async components.
//
type Props = {
  status: AsyncStatus;
  error: APIError | null;
  component: JSX.Element;
  customNotFound?: React.ReactNode;
  minHeight?: number;
};

const SectionLoader: React.FC<Props> = ({ status, error, component, customNotFound, minHeight }) => {
  if (status === 'Loading') {
    return (
      <SectionLoaderDefaultContainer
        style={{ textAlign: 'center', minHeight: minHeight || 'unset' }}
        data-testid="section-loader-loading"
      >
        <Spinner />
      </SectionLoaderDefaultContainer>
    );
  } else if (status === 'Error') {
    return (
      <SectionLoaderDefaultContainer style={{ minHeight: minHeight || 'unset' }} data-testid="section-loader-error">
        <APIErrorRenderer error={error} customNotFound={customNotFound} />
      </SectionLoaderDefaultContainer>
    );
  }
  return <div style={{ minHeight: minHeight || 'unset' }}>{component}</div>;
};

//
// Style
//

const SectionLoaderDefaultContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SectionLoader;
