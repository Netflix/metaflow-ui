import { useContext, useEffect, useMemo } from 'react';
import { PluginsContext } from '@components/Plugins/PluginManager';
import useResource, { Resource } from '@hooks/useResource';
import { Metadata } from '@/types';
import { metadataToRecord } from '@utils/metadata';

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

const emptyArray: Metadata[] = [];
const taskQueryParams = {
  _limit: '100',
  'attempt_id:is': 'null',
};
const updatePredicate = (a: Metadata, b: Metadata) => a.id === b.id;

function useTaskMetadata({ url, attemptId, paused }: TaskMetadataConfig): TaskMetadata {
  const { addDataToStore, clearDataStore } = useContext(PluginsContext);

  const config = useMemo(
    () => ({
      url: url,
      fetchAllData: true,
      updatePredicate,
      subscribeToEvents: true,
      initialData: emptyArray,
      pause: paused,
    }),
    [paused, url],
  );

  // Get metadata for tasks that don't have attempt id. We show them on every attempt
  const taskMetadataResource = useResource<Metadata[], Metadata>({
    ...config,
    queryParams: taskQueryParams,
    fetchAllData: true,
  });

  const attemptQueryParams = useMemo(
    () => ({
      _limit: '100',
      attempt_id: attemptId.toString(),
    }),
    [attemptId],
  );

  // Get metadata for current attempt
  const attemptMetadataResource = useResource<Metadata[], Metadata>({
    ...config,
    queryParams: attemptQueryParams,
    fetchAllData: true,
  });

  // Merge task and attempt data.
  const data = useMemo<Metadata[]>(() => {
    return taskMetadataResource.data && attemptMetadataResource.data
      ? [...taskMetadataResource.data, ...attemptMetadataResource.data]
      : [];
  }, [attemptMetadataResource.data, taskMetadataResource.data]);

  const dataCount = data.length;

  // Update metadata to plugin store
  useEffect(() => {
    addDataToStore('metadata', metadataToRecord(data));
  }, [dataCount, addDataToStore, data]);

  useEffect(() => {
    return () => clearDataStore('metadata');
  }, [url, attemptId, clearDataStore]);

  return { data, taskMetadataResource, attemptMetadataResource };
}

export default useTaskMetadata;
