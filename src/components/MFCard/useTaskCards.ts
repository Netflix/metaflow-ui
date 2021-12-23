import useResource, { Resource } from '../../hooks/useResource';
import { Task } from '../../types';

export type CardDefinition = {
  // Name of card
  type: string;
  // Id of card, used for fetching card HTML
  hash: string;
};

//
// Fetch list of card definitions for given task.
//
export default function useTaskCards(task: Task | null): Resource<CardDefinition[]> {
  const url = task
    ? `/flows/${task.flow_id}/runs/${task.run_number}/steps/${task.step_name}/tasks/${task.task_id}/cards`
    : '';

  const res = useResource<CardDefinition[], CardDefinition>({
    url,
    initialData: [],
    subscribeToEvents: false,
    pause: !task,
  });

  return res;
}
