import React, { useState, useEffect } from 'react';
import { endLogging, getLogs, startLogging } from '../../utils/debugdb';
import Button from '../Button';
import styled from 'styled-components';
import { StringParam, useQueryParams } from 'use-query-params';
import { ItemRow } from '../Structure';

const Logger: React.FC = () => {
  const [logging, setLogging] = useState(false);
  const [q, sq] = useQueryParams({ debug: StringParam });

  const stopLogging = () => {
    endLogging();
    sq({ debug: undefined }, 'replaceIn');
    localStorage.setItem('debug-mode', 'false');
    setLogging(false);
  };

  useEffect(() => {
    const setting = localStorage.getItem('debug-mode');
    if ((setting && setting === 'true') || q?.debug === '1') {
      setLogging(true);
      startLogging();
      localStorage.setItem('debug-mode', 'true');
    } else {
      stopLogging();
    }
  }, []); // eslint-disable-line

  return logging ? (
    <LoggerContainer>
      <ItemRow justify="space-between">
        <div style={{ width: '100%' }}>Recording logs</div>

        <ItemRow>
          <Button textOnly onClick={() => getLogs()}>
            Download logs
          </Button>
          <Button textOnly onClick={stopLogging}>
            Stop
          </Button>
        </ItemRow>
      </ItemRow>
    </LoggerContainer>
  ) : null;
};

//
// Style
//

const LoggerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  z-index: 999;
  background: #dd5d54;
  color: #fff;

  padding: 0.15rem 0 0.15rem 0.5rem;

  button {
    color: #fff;
    background: rgba(0, 0, 0, 0.2);

    &:hover {
      background: transparent;
      background: rgba(0, 0, 0, 0.1);
    }
  }
`;

export default Logger;
