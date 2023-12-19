import React, { useEffect } from 'react';
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
// Render single card in iframe.
//

const DynamicCardIframe: React.FC<Props> = ({ task, hash }) => {
  let ref: React.Ref<HTMLIFrameElement> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const taskCardsPath = (task: Task): string => {
    return `/flows/${task.flow_id}/runs/${task.run_number}/steps/${task.step_name}/tasks/${task.task_id}/cards/${hash}/data`;
  };

  const getNewData = (token: string, updateFn: (payload: object) => void) => {
    fetch(`${apiHttp(taskCardsPath(task))}?invalidate=true`)
      .then((result) => result.json())
      .then((result) => {
        if (token === result.payload?.reload_token) {
          updateFn(result.payload);
          if (!result.is_complete) {
            timeout = setTimeout(() => {
              getNewData(token, updateFn);
            }, INTERVAL);
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    const token = (ref as React.RefObject<HTMLIFrameElement>)?.current?.contentWindow?.METAFLOW_RELOAD_TOKEN;
    const updateFn = (ref as React.RefObject<HTMLIFrameElement>)?.current?.contentWindow?.metaflow_card_update;

    if (updateFn) {
      timeout = setTimeout(() => {
        getNewData(token, updateFn);
      }, INTERVAL);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return <CardIframe path={`${taskCardPath(task, hash)}?embed=true`} ref={ref} />;
};

export default DynamicCardIframe;
