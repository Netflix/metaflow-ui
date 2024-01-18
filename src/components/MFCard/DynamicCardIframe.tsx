import React, { useCallback, useRef } from 'react';
import { DYNAMIC_CARDS_REFRESH_INTERVAL, apiHttp } from '../../constants';
import { taskCardPath } from '../../components/MFCard/useTaskCards';
import { Task } from '../../types';
import CardIframe from './CardIframe';

type Props = {
  task: Task;
  hash: string;
};

//
// Wrap Card iframe with functions to enable dynamism
//

const DynamicCardIframe: React.FC<Props> = ({ task, hash }) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  // Get new data from the server and update the card
  const getNewData = useCallback(
    (token: string, updateFn: (payload: object) => void, iframe: HTMLIFrameElement) => {
      // Generate path
      const taskCardsPath = (task: Task): string => {
        return `/flows/${task.flow_id}/runs/${task.run_number}/steps/${task.step_name}/tasks/${task.task_id}/cards/${hash}/data`;
      };

      fetch(`${apiHttp(taskCardsPath(task))}?invalidate=true`)
        .then((result) => result.json())
        .then((result) => {
          if (token === result.data?.reload_token) {
            // Call the callback provided by the card to add new data
            updateFn(result.data?.data);

            if (!(result.data?.reload_token === 'final')) {
              timeoutRef.current = setTimeout(() => {
                getNewData(token, updateFn, iframe);
              }, DYNAMIC_CARDS_REFRESH_INTERVAL);
            }
          } else {
            iframe?.contentWindow?.location.reload();
          }
        })
        .catch((err) => {
          console.error('Error fetching dynamic card data: ', err);
          timeoutRef.current = setTimeout(() => {
            getNewData(token, updateFn, iframe);
          }, DYNAMIC_CARDS_REFRESH_INTERVAL);
        });
    },
    [task, hash],
  );

  const handleIframeLoad = (iframe: HTMLIFrameElement) => {
    const token = iframe?.contentWindow?.METAFLOW_RELOAD_TOKEN;
    const updateFn = iframe?.contentWindow?.metaflow_card_update;

    // If the card supplies a reload token and an update function, start the refresh loop
    if (updateFn && token) {
      timeoutRef.current = setTimeout(() => {
        getNewData(token, updateFn, iframe);
      }, DYNAMIC_CARDS_REFRESH_INTERVAL);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  };

  return <CardIframe path={`${taskCardPath(task, hash)}?embed=true&invalidate=true`} onLoad={handleIframeLoad} />;
};

export default DynamicCardIframe;
