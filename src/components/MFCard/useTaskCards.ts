import { useEffect, useRef, useState } from 'react';
import { apiHttp } from '../../constants';
import { DataModel } from '../../hooks/useResource';
import { Task } from '../../types';
import { Decorator } from '../DAG/DAGUtils';

type CardResultState = 'loading' | 'timeout' | 'success';

export type CardResult = {
  status: CardResultState;
  cards: CardDefinition[];
};

export type CardDefinition = {
  // ID of custom card
  id?: string;
  // Name of card
  type: string;
  // Used for fetching card HTML
  hash: string;
};

export function taskCardsPath(task: Task): string {
  return `/flows/${task.flow_id}/runs/${task.run_number}/steps/${task.step_name}/tasks/${task.task_id}/cards`;
}

export function taskCardPath(task: Task, hash: string): string {
  return `${taskCardsPath(task)}/${hash}`;
}

const POSTLOAD_POLL_INTERVAL = 5000;

//
// Fetch list of card definitions for given task according to the decorators.
// Returns a status and a list of cards (if any)
//
export default function useTaskCards(task: Task | null, decorators: Decorator[]): CardResult {
  const [data, setData] = useState<CardDefinition[]>([]);
  const [poll, setPoll] = useState(false);
  const [status, setStatus] = useState<CardResultState>('loading');

  const url = task ? taskCardsPath(task) : '';
  const expectedCards = decorators.filter((item) => item.name === 'card');
  // timeout in seconds
  const maxTimeout: number = expectedCards.reduce((timeout, decorator) => {
    if (typeof decorator.attributes.timeout === 'number' && decorator.attributes.timeout > timeout) {
      return decorator.attributes.timeout;
    }
    return timeout;
  }, 0);

  const aborter = useRef<AbortController>();

  function fetchCards(path: string, invalidate = false) {
    setPoll(false);

    if (aborter.current) {
      aborter.current.abort();
    }

    const currentAborter = new AbortController();
    aborter.current = currentAborter;
    // We want to invalidate cache when polling since cache would return old results.
    // First request will be iwthout invalidate and if that returns us all expected cards
    // we dont need to poll and invalidate.
    fetch(`${apiHttp(path)}${invalidate ? '?invalidate=true' : ''}`)
      .then((result) => result.json())
      .then((result: DataModel<CardDefinition[]>) => {
        if (result.status === 200) {
          setData(result.data);
        }
      })
      .catch(() => {
        console.warn('Cards request failed');
      })
      .finally(() => {
        setPoll(true);
      });
  }

  const taskFinishedAt = task?.finished_at;
  // Poll for new cards
  useEffect(() => {
    let t: number;
    // Check if polling is activated (activated after finished requests).
    if (poll) {
      // Timeout timer is: task.finished_at + timeout from decorator attributes + 30seconds extra time.
      const timeout = taskFinishedAt ? taskFinishedAt + (maxTimeout + 30) * 1000 : false;
      // if we have enough cards (as presented by decorators list) or timeout has passed, skip request.
      if (expectedCards.length <= data.length) {
        setPoll(false);
        setStatus('success');
      } else if (timeout && timeout < Date.now()) {
        setPoll(false);
        setStatus('timeout');
      } else {
        setStatus('loading');
        t = window.setTimeout(() => {
          fetchCards(url, true);
        }, POSTLOAD_POLL_INTERVAL);
      }
    }

    return () => {
      clearTimeout(t);
    };
  }, [url, poll, data, expectedCards, maxTimeout, taskFinishedAt, status]);

  // Initial fetch
  useEffect(() => {
    fetchCards(url);

    return () => {
      setData([]);
    };
  }, [url]);

  return { status, cards: data };
}
