import { TFunction } from 'i18next';
import { TableColDefinition } from '.';

const columns: (t: TFunction, queryParams: Record<string, string>) => TableColDefinition[] = (t, queryParams) =>
  [
    { label: t('fields.run'), key: 'run', width: '25%' },
    {
      label: t('fields.flow_id'),
      key: 'flow_id',
      sortable: true,
      hidden: queryParams._group === 'flow_id',
    },
    {
      label: t('fields.project'),
      key: 'project',
      sortable: true,
    },
    { label: t('fields.started-at'), sortable: true, key: 'ts_epoch', alignment: 'right' as const, width: '8rem' },
    { label: t('fields.duration'), sortable: true, key: 'duration', alignment: 'right' as const, width: '5rem' },
    {
      label: t('fields.finished-at'),
      sortable: true,
      key: 'finished_at',
      alignment: 'right' as const,
      width: '8rem',
    },
    { label: t('fields.triggered-by'), key: 'trigger' },
    { label: t('fields.user-tags'), key: 'tags' },
  ].filter((item) => !item.hidden);

export default columns;
