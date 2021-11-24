import React, { useEffect, useRef, useState } from 'react';
import { apiHttp } from '../../constants';

type Props = {
  path: string;
};

const CardIframe: React.FC<Props> = ({ path }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [elementHeight, setElementHeight] = useState(0);

  useEffect(() => {
    setInterval(() => {
      if (ref.current) {
        const h = ref.current.contentDocument?.documentElement.offsetHeight;
        if (h) {
          setElementHeight(h);
        }
      }
    }, 1000);
  }, []);

  return (
    <div>
      <iframe
        ref={ref}
        title={'xd'}
        style={{
          width: '100%',
          border: 'none',
          background: 'rgba(0,0,0,0.03)',
          height: elementHeight + 'px',
        }}
        src={apiHttp(path)}
      />
    </div>
  );
};
export default CardIframe;
