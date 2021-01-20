import { Row } from '../components/Timeline/VirtualizedTimeline';

const takeSmallest = (a: Row): number =>
  a.type === 'task' ? a.data[0].started_at || a.data[0].ts_epoch : a.data.ts_epoch;

const takeBiggest = (a: Row): number =>
  (a.type === 'task' ? a.data[a.data.length - 1].finished_at : a.data.finished_at) || 0;

export const startAndEndpointsOfRows = (rows: Row[]): { start: number; end: number } => {
  const start = rows.sort((a, b) => takeSmallest(a) - takeSmallest(b))[0];
  const end = rows.sort((a, b) => takeBiggest(b) - takeBiggest(a))[0];

  return {
    start: start ? takeSmallest(start) : 0,
    end: end ? takeBiggest(end) : 0,
  };
};

export const getLongestRowDuration = (rows: Row[]): number => {
  return rows.reduce((val, item) => {
    if (item.type === 'task') {
      const t = item.data[item.data.length - 1];
      return t.duration && t.duration > val ? t.duration : val;
    } else {
      return item.rowObject.duration > val ? item.rowObject.duration : val;
    }
  }, 0);
};

export const getTaskLineStatus = (rows: Row[]): 'ok' | 'failed' | 'running' | 'unknown' => {
  const statuses = rows.map((row) => {
    if (row.type === 'task') {
      return row.data.length > 1 ? 'failed' : row.data.length === 1 ? row.data[0].status : 'unknown';
    }
    return row.rowObject.isFailed ? 'failed' : 'ok';
  });
  if (statuses.indexOf('failed') > -1) return 'failed';
  if (statuses.indexOf('unknown') > -1) return 'unknown';
  if (statuses.indexOf('running') > -1) return 'running';
  return 'ok';
};
