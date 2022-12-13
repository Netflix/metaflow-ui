import React, { useEffect, useState } from 'react';
import useIsInViewport from 'use-is-in-viewport';
import { AsyncStatus } from '../../../types';

import Spinner from '../../../components/Spinner';
import { ItemRow } from '../../../components/Structure';

//
// Component which triggers update function when ever in viewport. Max once per 250ms
//

type AutoLoadProps = {
  loadMore: () => void;
  status: AsyncStatus;
  resultAmount: number;
};

const AutoLoadTrigger: React.FC<AutoLoadProps> = ({ loadMore, status, resultAmount }) => {
  const [isInViewport, targetRef] = useIsInViewport({
    modBottom: '400px',
  });
  // Track active status so we don't ever spam requests
  const [isUpdatable, setIsUpdatable] = useState(false);
  // If component is in viewport, is ready from earlier request AND request is OK we can load more.
  useEffect(() => {
    if (isInViewport && isUpdatable && status === 'Ok') {
      loadMore();
      setIsUpdatable(false);
    }
  }, [isInViewport, loadMore, isUpdatable, status]);

  // Set updatable AFTER previous request was OK
  useEffect(() => {
    let to: null | number = null;

    if (status === 'Ok' && !isUpdatable) {
      to = window.setTimeout(() => {
        setIsUpdatable(true);
      }, 250);
    }
    return () => (to ? window.clearTimeout(to) : undefined);
  }, [status, isUpdatable]);

  // Let trigger be disabled for half a second on initial render
  useEffect(() => {
    const to = setTimeout(() => {
      setIsUpdatable(true);
    }, 500);
    return () => window.clearTimeout(to);
  }, []);

  return (
    <>
      {status === 'Loading' && (
        <ItemRow justify="center" margin="md">
          {resultAmount > 0 ? <Spinner sm /> : <Spinner md />}
        </ItemRow>
      )}
      <div ref={targetRef} />
    </>
  );
};

export default AutoLoadTrigger;
