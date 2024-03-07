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
  const cacheTimestampRef = useRef<number | undefined>();
  // Get new data from the server and update the card
  const getNewData = useCallback(
    (token: string, updateFn: (payload: object) => void, iframe: HTMLIFrameElement) => {
      // Generate path
      const taskCardsPath = (task: Task): string => {
        return `/flows/${task.flow_id}/runs/${task.run_number}/steps/${task.step_name}/tasks/${task.task_id}/cards/${hash}/data`;
      };

      fetch(`${apiHttp(taskCardsPath(task))}?invalidate=true`)
        .then((result) => {
          if (!result.ok) {
            throw new Error('Failed to fetch');
          }
          return result.json();
        })
        .then((result) => {
          // check if the data attribute exists and is not null
          // If it is null, we will retry after a timeout
          if (result.data === null) {
            timeoutRef.current = setTimeout(() => {
              getNewData(token, updateFn, iframe);
            }, DYNAMIC_CARDS_REFRESH_INTERVAL);
            return;
          }

          // The `reload_token` controls if the card iframe itself should be reloaded since the actual card content has changed
          // So we first check if the reload_token in the data update is the same as the reload_token present inside the card.
          // If they are not the same then we reload the iframe.
          if (token === result.data?.reload_token) {
            // Every data update call for a card since Metaflow 2.11.4 will contain a `created_on` timestamp.
            // This timestamp helps validate if the data update is newer than the previous one.
            // This check is necessary because the data updates are best effort and may be out of order given that they are coming from the local
            // cache in the Metaflow service.
            if (result.data?.created_on) {
              // The `cacheTimestampRef` helps keep track of the latest data update timestamp the UI has recieved for a particular card.
              // If any new update has a `created_on` timestamp that is older than the latest one we have seen, we ignore it.
              // If we update the UI with data from an older timestamp, it will appear to the user as if the UI is moving a older state from a newer state.
              // For example : progressbars moving backwards.
              if (cacheTimestampRef.current === undefined || cacheTimestampRef.current < result.data?.created_on) {
                cacheTimestampRef.current = result.data?.created_on;
                updateFn(result.data?.data);
              }
            } else {
              // This code path is for older Metaflow versions that do not have the `created_on` timestamp in the data update payload.
              // In this case, we update the card with the new data without any checks.
              updateFn(result.data?.data);
            }

            // If the reload_token is not 'final', we continue the refresh loop
            if (!(result.data?.reload_token === 'final')) {
              timeoutRef.current = setTimeout(() => {
                getNewData(token, updateFn, iframe);
              }, DYNAMIC_CARDS_REFRESH_INTERVAL);
            }
          } else {
            iframe?.contentWindow?.location.reload();
          }
        })
        .catch((_) => {
          // We deliberately ignore errors here and retry after a timeout because data update calls are best effort.
          // data update calls may send 404's if the data is not available in the local cache or the cache is just getting populated.
          // In such cases, we any ways retry after a timeout.
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
    cacheTimestampRef.current = -1;
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
