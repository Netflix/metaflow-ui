import { Row } from '../components/Timeline/VirtualizedTimeline';
import { TaskStatus } from '../types';

const takeSmallest = (a: Row): number | null => (a.type === 'task' ? a.data[0].started_at || null : a.data.ts_epoch);

const takeBiggest = (a: Row): number =>
  (a.type === 'task' ? a.data[a.data.length - 1].finished_at : a.data.finished_at) || 0;

const sortSmallest = (a: Row, b: Row) => {
  const aval = takeSmallest(a);
  const bval = takeSmallest(b);

  if (aval === bval) {
    return 0;
  }
  if (!aval) {
    return -1;
  } else if (!bval) {
    return 1;
  }
  return aval - bval;
};

export const startAndEndpointsOfRows = (rows: Row[]): { start: number; end: number } => {
  const start = rows.sort(sortSmallest)[0];
  const end = rows.sort((a, b) => takeBiggest(b) - takeBiggest(a))[0];

  return {
    start: start ? takeSmallest(start) || 0 : 0,
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

export const getTaskLineStatus = (rows: Row[]): TaskStatus => {
  const statuses = rows.map((row) => {
    if (row.type === 'task') {
      return row.data.length > 0 ? row.data[0].status || 'unknown' : 'unknown';
    }
    return row.rowObject.status;
  });
  if (statuses.indexOf('running') > -1) return 'running';
  if (statuses.indexOf('failed') > -1) return 'failed';
  if (statuses.indexOf('unknown') > -1) return 'unknown';
  return 'completed';
};
