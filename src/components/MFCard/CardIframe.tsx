import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { apiHttp } from '../../constants';

const CHECK_HEIGHT_INTERVAL = 1000;

type Props = {
  path: string;
};

//
// Render single card in iframe.
//

const CardIframe: React.FC<Props> = ({ path }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [elementHeight, setElementHeight] = useState(0);

  // Check iframe height every second in case it changes somehow.
  useEffect(() => {
    setInterval(() => {
      if (ref.current) {
        const body = ref.current.contentWindow?.document.body;
        const h = Math.max(body?.scrollHeight ?? 0, body?.clientHeight ?? 0, body?.offsetHeight ?? 0);
        if (h) {
          setElementHeight(h);
        }
      }
    }, CHECK_HEIGHT_INTERVAL);
  }, []);

  return (
    <div>
      <StyledCardIframe
        ref={ref}
        title="Card"
        style={{
          height: elementHeight + 'px',
        }}
        src={apiHttp(path)}
      />
    </div>
  );
};

const StyledCardIframe = styled.iframe`
  width: 100%;
  border: none;
  background: rgba(0, 0, 0, 0.03);
`;

export default CardIframe;
