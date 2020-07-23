import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PropertyTable from '../../components/PropertyTable';
import InformationRow from '../../components/InformationRow';
import { useTranslation } from 'react-i18next';
import { Run as IRun, Task as ITask, Artifact } from '../../types';
import useResource from '../../hooks/useResource';
import { formatDuration } from '../../utils/format';
import { getISOString } from '../../utils/date';
import StatusField from '../../components/Status';

//
// View container
//

type TaskViewContainer = { run: IRun | null; stepName?: string; taskId?: string };

const TaskViewContainer: React.FC<TaskViewContainer> = ({ run, stepName, taskId }) => {
  const { t } = useTranslation();
  if (!run?.run_number || !stepName || !taskId) {
    return <>{t('run.no-run-data')}</>;
  }

  return <Task run={run} stepName={stepName} taskId={taskId} />;
};

//
// Task view
//

type TaskViewProps = { run: IRun; stepName: string; taskId: string };

const Task: React.FC<TaskViewProps> = ({ run, stepName, taskId }) => {
  const { t } = useTranslation();
  const { data: task, error } = useResource<ITask, ITask>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}`,
    subscribeToEvents: true,
    initialData: null,
  });

  const { data: artifacts } = useResource<Artifact[], Artifact>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/artifacts`,
    subscribeToEvents: true,
    initialData: null,
  });

  return (
    <TaskContainer>
      {!task && t('task.loading')}
      {error || (task && !task.task_id && t('task.could-not-find-task'))}
      {task && task.task_id && (
        <AnchoredView
          sections={[
            {
              key: 'taskinfo',
              label: t('task.task-info'),
              component: (
                <InformationRow spaceless>
                  <PropertyTable
                    items={[task]}
                    columns={[
                      { label: t('fields.task-id') + ':', prop: 'task_id' },
                      { label: t('fields.status') + ':', accessor: (_item) => <StatusField status={'completed'} /> },
                      {
                        label: t('fields.started-at') + ':',
                        accessor: (item) => (item.ts_epoch ? getISOString(new Date(item.ts_epoch)) : ''),
                      },
                      {
                        label: t('fields.finished-at') + ':',
                        accessor: (item) => (item.finished_at ? getISOString(new Date(item.finished_at)) : ''),
                      },
                      {
                        label: t('fields.duration') + ':',
                        accessor: (item) => (item.duration ? formatDuration(item.duration) : ''),
                      },
                    ]}
                  />
                </InformationRow>
              ),
            },
            {
              key: 'links',
              label: t('task.links'),
              component: <KeyValueList items={[]} />,
            },
            {
              key: 'stdout',
              label: t('task.std-out'),
              component: <StyledCodeBlock>{`Std out is not available yet`}</StyledCodeBlock>,
            },
            {
              key: 'stderr',
              label: t('task.std-err'),
              component: <StyledCodeBlock>{`Std err is not available yet`}</StyledCodeBlock>,
            },
            {
              key: 'artifacts',
              label: t('task.artifacts'),
              component: (
                <InformationRow spaceless>
                  <PropertyTable
                    items={artifacts || []}
                    columns={[
                      { label: t('fields.artifact-name') + ':', prop: 'name' },
                      { label: t('fields.location') + ':', prop: 'location' },
                      { label: t('fields.datastore-type') + ':', prop: 'ds_type' },
                      { label: t('fields.type') + ':', prop: 'type' },
                      { label: t('fields.content-type') + ':', prop: 'content_type' },
                    ]}
                  />
                </InformationRow>
              ),
            },
          ]}
        />
      )}
    </TaskContainer>
  );
};

//
// Anchored View
//

type AnchoredViewSection = {
  key: string;
  label: string;
  component: React.ReactNode;
};

type AnchoredViewProps = {
  sections: AnchoredViewSection[];
};

const AnchoredView: React.FC<AnchoredViewProps> = ({ sections }) => {
  const [sectionPositions, setSectionPositions] = useState<Record<number, number>>({});

  return (
    <AnchoredViewContainer>
      <TaskContent>
        {sections.map((section, index) => (
          <TaskSection
            key={section.key}
            label={section.label}
            sectionkey={section.key}
            updatePosition={(offsetTop) => {
              const exists = sectionPositions[index];
              if (!exists || (exists && exists !== offsetTop)) {
                setSectionPositions((cur) => ({ ...cur, [index]: offsetTop }));
              }
            }}
          >
            {section.component}
          </TaskSection>
        ))}
      </TaskContent>

      <TaskSidebar>
        <AnchorMenu
          items={sections.map(({ key, label }, index) => ({ key, label, position: sectionPositions[index] }))}
        />
      </TaskSidebar>
    </AnchoredViewContainer>
  );
};

const TaskContainer = styled.div`
  display: flex;
  padding: 25px 0;
  width: 100%;
`;

const AnchoredViewContainer = styled.div`
  display: flex;
  width 100%;
`;

const TaskContent = styled.div`
  flex: 1;
  max-width: 80%;
  padding: 0 2rem 0 0;
`;

const TaskSidebar = styled.div`
  flex-basis: 250px;
  padding: 1rem;
`;

const StyledCodeBlock = styled.div`
  padding: 1rem;
  background: ${(props) => props.theme.color.bg.light};
  border-bottom: 1px solid ${(props) => props.theme.color.border.light};
  font-family: monospace;
  border-radius: 4px;
  font-size: 14px;
  white-space: pre-wrap;
`;

//
// Task section presents one title section of task view
//

const TaskSection: React.FC<{ label: string; sectionkey: string; updatePosition: (offsetTop: number) => void }> = ({
  label,
  sectionkey,
  updatePosition,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const offset = ref?.current?.offsetTop;
    if (offset) {
      updatePosition(offset);
    }
  }, [updatePosition, ref]);

  return (
    <TaskSectionContainer ref={ref} id={sectionkey}>
      <TaskSectionHeader>
        <h3>{label}</h3>
      </TaskSectionHeader>
      <TaskSectionContent>{children}</TaskSectionContent>
    </TaskSectionContainer>
  );
};

const TaskSectionContainer = styled.div`
  margin-bottom: 2rem;
`;
const TaskSectionHeader = styled.div`
  padding: 0 1rem;
  border-bottom: 1px solid ${(props) => props.theme.color.border.light};

  h3 {
    margin: 0.75rem 0;
  }
`;
const TaskSectionContent = styled.div`
  padding: 15px;
`;

//
// Basic key value listing
//

const KeyValueList: React.FC<{ items: { label: string; content: React.ReactNode }[] }> = ({ items }) => (
  <div>
    {items.map((item) => (
      <KeyValueListRow key={item.label}>
        <KeyValueListLabel>{item.label}</KeyValueListLabel>
        <div>{item.content}</div>
      </KeyValueListRow>
    ))}
  </div>
);

const KeyValueListRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const KeyValueListLabel = styled.div`
  flex-basis: 150px;
`;

//
// Anchor menu
//

type AnchorItem = {
  key: string;
  label: string;
  position?: number;
};

type AnchorMenuProps = {
  items: AnchorItem[];
};

const AnchorMenu: React.FC<AnchorMenuProps> = ({ items }) => {
  const [viewScrollTop, setScrollTop] = useState(0);
  const [active, setActive] = useState<string | undefined>(items[0]?.key);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = () => {
      setScrollTop(window.scrollY);
      const current = [...items].reverse().find((item) => item.position && item.position < window.scrollY + 112);
      setActive((current && current.key) || items[0]?.key);
    };

    window.addEventListener('scroll', listener);

    return () => window.removeEventListener('scroll', listener);
  }, [items]);

  return (
    <div ref={ref}>
      <div
        style={
          // Adding header height here manually. We need to think it makes sense to have sticky header
          {
            transform: `translateY(${
              ref && ref.current && viewScrollTop + 112 > ref.current.offsetTop
                ? viewScrollTop + 112 - ref.current.offsetTop
                : 0
            }px)`,
          }
        }
      >
        {items.map(({ key, label, position }) => (
          <AnchorMenuItem
            key={key}
            active={key === active}
            onClick={() => {
              if (position) {
                window.scroll({ top: position - 111 });
              }
            }}
          >
            {label}
          </AnchorMenuItem>
        ))}
      </div>
    </div>
  );
};

const AnchorMenuItem = styled.div<{ active?: boolean }>`
  cursor: pointer;
  line-height: 2rem;
  padding: 0 1rem;
  margin-bottom 0.5rem;
  border-left: 2px solid ${(p) => (p.active ? p.theme.color.text.blue : p.theme.color.border.light)};
  transition: 0.15s border;
`;

export default TaskViewContainer;
