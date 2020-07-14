import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PropertyTable from '../../components/PropertyTable';
import InformationRow from '../../components/InformationRow';

const Task: React.FC = () => {
  return (
    <TaskContainer>
      <AnchoredView
        sections={[
          {
            key: 'taskinfo',
            label: 'Task info',
            component: (
              <InformationRow spaceless>
                <PropertyTable
                  items={[
                    { label: 'Task id:', content: '115' },
                    { label: 'Status:', content: 'Completed' },
                    { label: 'Started at:', content: '115' },
                    { label: 'Finished at:', content: '115' },
                    { label: 'Duration:', content: '13m 45s' },
                  ]}
                />
              </InformationRow>
            ),
          },
          {
            key: 'links',
            label: 'Links',
            component: (
              <KeyValueList
                items={[
                  { label: 'Weather report', content: <a href="https://www.google.com/search?q=weather">Test</a> },
                ]}
              />
            ),
          },
          {
            key: 'stdout',
            label: 'Std out',
            component: (
              <StyledCodeBlock>
                {`metadata_service_ui_backend | [BUILTIN] '' VALUES: ''
metadata_service_ui_backend | [CUSTOM] '' VALUES: ''
metadata_service_ui_backend | Results: DBResponse(response_code=200, body={'flow_id': 'HugeFlow', 'run_number': 19, 'user_name': 'SanteriCM', 'status': 'completed', 'ts_epoch': 1594632036342, 'finished_at': 1594632067962, 'duration': 31620, 'tags': [], 'system_tags': ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-13', 'metaflow_version:2.0.5']}) DBPagination(limit=10, offset=0, count=1, count_total=1, page=1, pages_total=1)
metadata_service_ui_backend | Unsubscribe f0ee3489-1824-49bb-8ba1-50de4b8188c7
metadata_service_ui_backend | Subscriptions: []
metadata_service_ui_backend | Subscribe f0ee3489-1824-49bb-8ba1-50de4b8188c7 /flows/HugeFlow/runs/19`}
              </StyledCodeBlock>
            ),
          },
          {
            key: 'stderr',
            label: 'Std err',
            component: (
              <StyledCodeBlock>
                {`metadata_service_ui_backend | [BUILTIN] '' VALUES: ''
metadata_service_ui_backend | [CUSTOM] '' VALUES: ''
metadata_service_ui_backend | Results: DBResponse(response_code=200, body={'flow_id': 'HugeFlow', 'run_number': 19, 'user_name': 'SanteriCM', 'status': 'completed', 'ts_epoch': 1594632036342, 'finished_at': 1594632067962, 'duration': 31620, 'tags': [], 'system_tags': ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-13', 'metaflow_version:2.0.5']}) DBPagination(limit=10, offset=0, count=1, count_total=1, page=1, pages_total=1)
metadata_service_ui_backend | Unsubscribe f0ee3489-1824-49bb-8ba1-50de4b8188c7
metadata_service_ui_backend | Subscriptions: []
metadata_service_ui_backend | Subscribe f0ee3489-1824-49bb-8ba1-50de4b8188c7 /flows/HugeFlow/runs/19`}
              </StyledCodeBlock>
            ),
          },
          {
            key: 'artifacts',
            label: 'Artifacts',
            component: (
              <InformationRow spaceless>
                <PropertyTable
                  items={[
                    { label: 'Artifact name:', content: '_foreach_stack' },
                    { label: 'Location:', content: 'https://something' },
                    { label: 'Datastore type:', content: 'Remote' },
                    { label: 'Type:', content: 'metaflow.artifact' },
                    { label: 'Content type:', content: 'gzip+pickle-v2' },
                  ]}
                />
                <PropertyTable
                  noHeader
                  items={[
                    { label: 'Artifact name:', content: '_foreach_stack' },
                    { label: 'Location:', content: 'https://something' },
                    { label: 'Datastore type:', content: 'Remote' },
                    { label: 'Type:', content: 'metaflow.artifact' },
                    { label: 'Content type:', content: 'gzip+pickle-v2' },
                  ]}
                />
              </InformationRow>
            ),
          },
        ]}
      />
    </TaskContainer>
  );
};

type AnchoredViewSection = {
  key: string;
  label: string;
  component: React.ReactNode;
};

type AnchoredViewProps = {
  sections: AnchoredViewSection[];
};

const AnchoredView: React.FC<AnchoredViewProps> = ({ sections }) => {
  return (
    <AnchoredViewContainer>
      <TaskContent>
        {sections.map((section) => (
          <TaskSection key={section.key} label={section.label} sectionkey={section.key}>
            {section.component}
          </TaskSection>
        ))}
      </TaskContent>

      <TaskSidebar>
        <AnchorMenu active="taskinfo" items={sections.map(({ key, label }) => ({ key, label }))} />
      </TaskSidebar>
    </AnchoredViewContainer>
  );
};

const TaskContainer = styled.div`
  display: flex;
  padding: 25px 0;
`;

const AnchoredViewContainer = styled.div`
  display: flex;
`;

const TaskContent = styled.div`
  flex: 1;
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
  border-radius: 4px;
  font-size: 14px;
  white-space: pre-wrap;
`;

//
// Task section presents one title section of task view
//

const TaskSection: React.FC<{ label: string; sectionkey: string }> = ({ label, sectionkey, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  console.log(ref?.current?.offsetTop);
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
};

type AnchorMenuProps = {
  items: AnchorItem[];
  active?: string;
};

const AnchorMenu: React.FC<AnchorMenuProps> = ({ items, active }) => {
  const [viewScrollTop, setScrollTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = () => setScrollTop(window.scrollY);

    window.addEventListener('scroll', listener);

    return () => window.removeEventListener('scroll', listener);
  }, []);

  return (
    <div ref={ref}>
      <AnchorMenuContainer
        offset={
          // Adding header height here manually. We need to think it makes sense to have sticky header
          ref && ref.current && viewScrollTop + 112 > ref.current.offsetTop
            ? viewScrollTop + 112 - ref.current.offsetTop
            : 0
        }
      >
        {items.map(({ key, label }) => (
          <AnchorMenuItem key={key} active={active === key}>
            {label}
          </AnchorMenuItem>
        ))}
      </AnchorMenuContainer>
    </div>
  );
};

const AnchorMenuContainer = styled.div<{ offset: number }>`
  padding-top: ${(p) => p.offset}px;
`;

const AnchorMenuItem = styled.div<{ active: boolean }>`
  cursor: pointer;
  line-height: 2rem;
  padding: 0 1rem;
  margin-bottom 0.5rem;
  border-left: 2px solid ${(p) => (p.active ? p.theme.color.text.blue : p.theme.color.border.light)};
`;

export default Task;
