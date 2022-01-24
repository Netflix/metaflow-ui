import { useContext, useEffect } from 'react';
import { PluginsContext } from '../../components/Plugins/PluginManager';
import useResource, { Resource } from '../../hooks/useResource';
import { Metadata } from '../../types';
import { metadataToRecord } from '../../utils/metadata';

type TaskMetadataConfig = {
  url: string;
  attemptId: number;
  paused: boolean;
};

type TaskMetadata = {
  data: Metadata[];
  taskMetadataResource: Resource<Metadata[]>;
  attemptMetadataResource: Resource<Metadata[]>;
};

function useTaskMetadata({ url, attemptId, paused }: TaskMetadataConfig): TaskMetadata {
  const { addDataToStore } = useContext(PluginsContext);

  const config = {
    url: url,
    fetchAllData: true,
    updatePredicate: (a: Metadata, b: Metadata) => a.id === b.id,
    subscribeToEvents: true,
    initialData: [],
    pause: paused,
  };

  // Get metadata for tasks that don't have attempt id. We show them on every attempt
  const taskMetadataResource = useResource<Metadata[], Metadata>({
    ...config,
    queryParams: {
      _limit: '100',
      'attempt_id:is': 'null',
    },
  });

  // Get metadata for current attempt
  const attemptMetadataResource = useResource<Metadata[], Metadata>({
    ...config,
    queryParams: {
      _limit: '100',
      attempt_id: attemptId.toString(),
    },
  });

  // Merge task and attempt data.
  const data =
    taskMetadataResource.data && attemptMetadataResource.data
      ? [...taskMetadataResource.data, ...attemptMetadataResource.data]
      : [];

  const dataCount = data.length;

  // Update metadata to plugin store
  useEffect(() => {
    addDataToStore('metadata', metadataToRecord(data));
  }, [dataCount]); //eslint-disable-line

  useEffect(() => {
    return () => addDataToStore('metadata', {});
  }, [url, attemptId]); //eslint-disable-line

  return { data, taskMetadataResource, attemptMetadataResource };
}

export default useTaskMetadata;
