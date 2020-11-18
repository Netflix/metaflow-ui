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