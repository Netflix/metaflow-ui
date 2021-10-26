import React from 'react';
import styled from 'styled-components';
import { APIErrorRenderer } from '../../../components/GenericError';
import Spinner from '../../../components/Spinner';
import { APIError, AsyncStatus } from '../../../types';

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
  return component;
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
