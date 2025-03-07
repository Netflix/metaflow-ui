import React, { ReactEventHandler, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { MESSAGE_NAME } from '@components/Plugins/PluginManager';
import { apiHttp } from '@/constants';
import Spinner from '@components/Spinner';

const CHECK_HEIGHT_INTERVAL = 1000;

type Props = {
  path: string;
  onLoad: (iframe: HTMLIFrameElement) => void;
};

const FALLBACK_HEIGHT = 750; // arbitrary height that should show enough

//
// Render single card in iframe.
//

const CardIframe = ({ path, onLoad }: Props) => {
  const [elementHeight, setElementHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);

  // Check iframe height every second in case it changes somehow.
  useEffect(() => {
    let body: HTMLElement | undefined;

    // Listen for a message from the iframe to check the height.
    const listener = (e: MessageEvent) => {
      // ensure the message is from the iframe we're interested in
      if (e.source === (ref as React.RefObject<HTMLIFrameElement>)?.current?.contentWindow) {
        if (e.data.type === MESSAGE_NAME.HEIGHT_CHECK) {
          if (typeof e.data.height === 'number') {
            // Stop checking iframe periodically if it tells us what height it is.
            clearInterval(interval);
            setElementHeight(e.data.height);
          } else {
            console.warn("Height assign request didn't have a height value");
          }
        }
      }
    };

    // Check to see if security allows access to the iframe (same domain).
    // If so, check the height every second
    // If not, wait for a postMessage from the iframe to set the height.
    const checkHeight = () => {
      try {
        body = (ref as React.RefObject<HTMLIFrameElement>)?.current?.contentWindow?.document.body;
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
  }, [ref]);

  const handleIframeLoad = () => {
    setLoading(false);
    if (ref?.current) {
      onLoad(ref?.current);
    }
  };

  const handleIframeError: ReactEventHandler<HTMLIFrameElement> = (e) => {
    console.error('Error loading card', e);
    setError(true);
  };

  return (
    <div style={{ width: '100%' }}>
      {error && <div>Something went wrong</div>}
      {loading && (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      )}
      <StyledCardIframe
        ref={ref}
        title="Card"
        style={{
          height: elementHeight + 'px',
          background: loading ? 'transparent' : 'rgba(0, 0, 0, 0.03)',
        }}
        src={apiHttp(path)}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
};

const StyledCardIframe = styled.iframe`
  width: 100%;
  border: none;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 110px;
`;

export default CardIframe;
