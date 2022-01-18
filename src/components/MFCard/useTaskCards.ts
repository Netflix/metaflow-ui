import { useEffect, useRef, useState } from 'react';
import { apiHttp } from '../../constants';
import { DataModel } from '../../hooks/useResource';
import { Task } from '../../types';
import { Decorator } from '../DAG/DAGUtils';

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
// We poll for 10minutes if all cards have not arrived.
const POLLING_TIMEOUT = 1000 * 60 * 10;

//
// Fetch list of card definitions for given task according decorators.
//
export default function useTaskCards(task: Task | null, decorators: Decorator[]): CardDefinition[] {
  const url = task ? taskCardsPath(task) : '';
  const expectedCards = decorators.filter((item) => item.name === 'card');
  const [data, setData] = useState<CardDefinition[]>([]);
  const [fetchTime, setFetchTime] = useState(Date.now());
  const [poll, setPoll] = useState(false);

  const aborter = useRef<AbortController>();

  function fetchCards(path: string) {
    if (aborter.current) {
      aborter.current.abort();
    }

    const currentAborter = new AbortController();
    aborter.current = currentAborter;

    fetch(apiHttp(path))
      .then((result) => result.json())
      .then((result: DataModel<CardDefinition[]>) => {
        if (result.status === 200) {
          setData(result.data);
        }
      })
      .catch((e) => {
        console.warn(e);
      })
      .finally(() => {
        setPoll(true);
      });
  }

  // Poll for new cards
  useEffect(() => {
    let t: number;

    if (poll) {
      if (expectedCards.length === data.length || fetchTime + POLLING_TIMEOUT < Date.now()) {
        setPoll(false);
      } else {
        t = window.setTimeout(() => {
          fetchCards(url);
        }, POSTLOAD_POLL_INTERVAL);
      }
    }

    return () => {
      clearTimeout(t);
    };
  }, [url, poll, data, expectedCards, fetchTime]);

  // Initial fetch
  useEffect(() => {
    setFetchTime(Date.now());
    fetchCards(url);

    return () => {
      setData([]);
    };
  }, [url]);

  return data;
}
