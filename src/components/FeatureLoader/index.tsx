import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Spinner from '../Spinner';

//
// Full page loader that hides everything until finished. We want to be
// sure that feature flags are loaded before showing the app so we dont get weird layout shifts
//

const FeatureFlagLoader: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(true);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <LoadContainer>
      <div style={{ marginTop: '3rem' }}>
        <Spinner md />
      </div>
      <Overlay show={!show} />
    </LoadContainer>
  );
};

const LoadContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  background: #fff;
`;

const Overlay = styled.div<{ show: boolean }>`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: #fff;
  transition: 1s opacity;
  opacity: ${(p) => (p.show ? '1' : '0')};
`;

export default FeatureFlagLoader;
