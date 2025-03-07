import { useCallback, useEffect, useRef, useState } from 'react';
import { apiHttp } from '@/constants';
import { DataModel } from '@hooks/useResource';
import { Task } from '@/types';
import { Decorator } from '@components/DAG/DAGUtils';

const POSTLOAD_POLL_INTERVAL = 500;

type CardResultState = 'loading' | 'timeout' | 'success' | 'error';
export type CardDefinition = {
  // ID of custom card
  id?: string;
  // Name of card
  type: string;
  // Used for fetching card HTML
  hash: string;
};

export type CardResult = {
  status: CardResultState;
  cards: CardDefinition[];
};

const emptyArray: CardDefinition[] = [];
const emptyTaskCard: CardResult = { status: 'loading', cards: emptyArray };

export function taskCardsPath(task: Task): string {
  return `/flows/${task.flow_id}/runs/${task.run_number}/steps/${task.step_name}/tasks/${task.task_id}/cards`;
}

export function taskCardPath(task: Task, hash: string): string {
  return `${taskCardsPath(task)}/${hash}`;
}

//
// Fetch list of card definitions for given task according to the decorators.
// Returns a status and a list of cards (if any)
//
export default function useTaskCards(task: Task | null, decorators: Decorator[]): CardResult {
  const [poll, setPoll] = useState(false);
  // Task cards are stored in a map where key is the url and value is the result
  // This is because this hook can be called with a stale task
  const [taskCards, setTaskCards] = useState<Record<string, CardResult>>({});
  const aborter = useRef<AbortController>();
  const taskFinishedAt = task?.finished_at;
  const expectedCards = decorators.filter((item) => item.name === 'card');

  const url = task ? taskCardsPath(task) : '';

  // timeout in seconds
  const maxTimeout: number = expectedCards.reduce((timeout, decorator) => {
    if (typeof decorator.attributes.timeout === 'number' && decorator.attributes.timeout > timeout) {
      return decorator.attributes.timeout;
    }
    return timeout;
  }, 0);

  const fetchCards = useCallback(
    (path: string, invalidate = false) => {
      if (!path) {
        return;
      }

      setPoll(false);

      if (aborter.current) {
        aborter.current.abort();
      }

      const currentAborter = new AbortController();
      aborter.current = currentAborter;
      // We want to invalidate cache when polling since cache would return old results.
      // First request will be without invalidate and if that returns us all expected cards
      // we don't need to poll and invalidate.
      fetch(`${apiHttp(path)}${invalidate ? '?invalidate=true' : ''}`)
        .then((result) => result.json())
        .then((result: DataModel<CardDefinition[]>) => {
          if (result.status === 200) {
            setTaskCards((prev) => ({
              ...prev,
              [path]: {
                ...prev[path],
                cards: result.data,
                status: result.data.length >= expectedCards.length ? 'success' : prev[path]?.status,
              },
            }));
          } else {
            // The request returned a 500 because there are no cards for this task
            setTaskCards((prev) => ({
              ...prev,
              [path]: {
                cards: prev[path]?.cards ?? [],
                status: result.status === 500 ? 'success' : 'error',
              },
            }));
          }
        })
        .catch((e) => {
          console.error('Cards request failed for ', apiHttp(path), e);
          setTaskCards((prev) => ({
            ...prev,
            [path]: { cards: prev[path]?.cards ?? [], status: 'error' },
          }));
        })
        .finally(() => {
          setPoll(true);
        });
    },
    [expectedCards.length],
  );

  // Poll for new cards
  useEffect(() => {
    let t: number;

    // Check if polling is activated (activated after finished requests).
    if (poll) {
      // if we have enough cards (as presented by decorators list) or timeout has passed, skip request.
      if (expectedCards.length <= taskCards[url]?.cards.length) {
        setPoll(false);
        if (taskCards[url]?.status !== 'success') {
          setTaskCards((prev) => ({
            ...prev,
            [url]: { cards: prev[url]?.cards ?? [], status: 'success' },
          }));
        }
        // If the timeout has been reached
      } else {
        // Otherwise set the status to loading and continue polling
        if (taskCards[url]?.status !== 'loading') {
          setTaskCards((prev) => ({
            ...prev,
            [url]: { cards: prev[url]?.cards ?? [], status: 'loading' },
          }));
        }
        t = window.setTimeout(() => {
          fetchCards(url, true);
        }, POSTLOAD_POLL_INTERVAL);
      }
    }

    return () => {
      clearTimeout(t);
    };
  }, [url, poll, expectedCards, maxTimeout, taskFinishedAt, fetchCards, taskCards]);

  // Initial fetch
  useEffect(() => {
    fetchCards(url);
  }, [fetchCards, url]);

  return taskCards[url] ?? emptyTaskCard;
}
