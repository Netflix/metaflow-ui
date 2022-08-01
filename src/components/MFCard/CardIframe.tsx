import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { MESSAGE_NAME } from '../Plugins/PluginManager';
import { apiHttp } from '../../constants';

const CHECK_HEIGHT_INTERVAL = 1000;

type Props = {
  path: string;
};

const FALLBACK_HEIGHT = 150;

//
// Render single card in iframe.
//

const CardIframe: React.FC<Props> = ({ path }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [elementHeight, setElementHeight] = useState(0);

  // Check iframe height every second in case it changes somehow.
  useEffect(() => {
    let body: HTMLElement | undefined;

    // Listen for a message from the iframe to check the height.
    const listener = (e: MessageEvent) => {
      if (e.data.type === MESSAGE_NAME.HEIGHT_CHECK) {
        if (typeof e.data.height === 'number') {
          // Stop checking iframe periodically if it tells us what height it is.
          clearInterval(interval);
          setElementHeight(e.data.height);
        } else {
          console.warn("Height assign request didn't have a height value");
        }
      }
    };

    // Check to see if security allows access to the iframe (same domain).
    // If so, check the height every second
    // If not, wait for a postMessage from the iframe to set the height.
    const checkHeight = () => {
      try {
        body = ref.current?.contentWindow?.document.body;
        if (body) {
          const h = Math.max(body?.scrollHeight ?? 0, body?.clientHeight ?? 0, body?.offsetHeight ?? 0);
          if (h) {
            setElementHeight(h);
          } else {
            setElementHeight(FALLBACK_HEIGHT);
          }
        }
      } catch (e) {
        setElementHeight(FALLBACK_HEIGHT);
      }
    };

    window.addEventListener('message', listener);

    // Check iframe height every second.
    const interval = setInterval(checkHeight, CHECK_HEIGHT_INTERVAL);

    return () => {
      clearInterval(interval);
      window.removeEventListener('message', listener);
    };
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
