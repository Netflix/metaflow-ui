import React, { useCallback, useEffect, useRef } from 'react';
import { apiHttp } from '../../constants';
import { taskCardPath } from '../../components/MFCard/useTaskCards';
import { Task } from '../../types';
import CardIframe from './CardIframe';

type Props = {
  task: Task;
  hash: string;
};

const INTERVAL = 1000;

//
// Wrap Card iframe with functions to enable dynamism
//

const DynamicCardIframe: React.FC<Props> = ({ task, hash }) => {
  let ref: React.Ref<HTMLIFrameElement> | undefined;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const getNewData = useCallback(
    (token: string, updateFn: (payload: object) => void) => {
      const taskCardsPath = (task: Task): string => {
        return `/flows/${task.flow_id}/runs/${task.run_number}/steps/${task.step_name}/tasks/${task.task_id}/cards/${hash}/data`;
      };

      fetch(`${apiHttp(taskCardsPath(task))}?invalidate=true`)
        .then((result) => result.json())
        .then((result) => {
          if (token === result.payload?.reload_token) {
            updateFn(result.payload);
            if (!result.is_complete) {
              timeoutRef.current = setTimeout(() => {
                getNewData(token, updateFn);
              }, INTERVAL);
            }
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [task, hash],
  );

  useEffect(() => {
    const token = (ref as React.RefObject<HTMLIFrameElement>)?.current?.contentWindow?.METAFLOW_RELOAD_TOKEN;
    const updateFn = (ref as React.RefObject<HTMLIFrameElement>)?.current?.contentWindow?.metaflow_card_update;

    if (updateFn && token) {
      timeoutRef.current = setTimeout(() => {
        getNewData(token, updateFn);
      }, INTERVAL);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [getNewData, ref]);

  return <CardIframe path={`${taskCardPath(task, hash)}?embed=true`} ref={ref} />;
};

export default DynamicCardIframe;
