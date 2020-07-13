import React from 'react';
import styled from 'styled-components';
import PropertyTable from '../../components/PropertyTable';
import InformationRow from '../../components/InformationRow';

const Task: React.FC = () => {
  return (
    <TaskContainer>
      <TaskContent>
        <TaskSection label="Task info">
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
        </TaskSection>
        <TaskSection label="Links">
          <KeyValueList
            items={[{ label: 'Weather report', content: <a href="https://www.google.com/search?q=weather">Test</a> }]}
          />
        </TaskSection>
        <TaskSection label="Std out">
          <StyledCodeBlock>
            {`metadata_service_ui_backend | [BUILTIN] '' VALUES: ''
metadata_service_ui_backend | [CUSTOM] '' VALUES: ''
metadata_service_ui_backend | Results: DBResponse(response_code=200, body={'flow_id': 'HugeFlow', 'run_number': 19, 'user_name': 'SanteriCM', 'status': 'completed', 'ts_epoch': 1594632036342, 'finished_at': 1594632067962, 'duration': 31620, 'tags': [], 'system_tags': ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-13', 'metaflow_version:2.0.5']}) DBPagination(limit=10, offset=0, count=1, count_total=1, page=1, pages_total=1)
metadata_service_ui_backend | Unsubscribe f0ee3489-1824-49bb-8ba1-50de4b8188c7
metadata_service_ui_backend | Subscriptions: []
metadata_service_ui_backend | Subscribe f0ee3489-1824-49bb-8ba1-50de4b8188c7 /flows/HugeFlow/runs/19`}
          </StyledCodeBlock>
        </TaskSection>
        <TaskSection label="Std err">
          <StyledCodeBlock>
            {`metadata_service_ui_backend | Results: DBResponse(response_code=200, body={'flow_id': 'HugeFlow', 'run_number': 19, 'user_name': 'SanteriCM', 'status': 'completed', 'ts_epoch': 1594632036342, 'finished_at': 1594632067962, 'duration': 31620, 'tags': [], 'system_tags': ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-13', 'metaflow_version:2.0.5']}) DBPagination(limit=10, offset=0, count=1, count_total=1, page=1, pages_total=1`}
          </StyledCodeBlock>
        </TaskSection>
        <TaskSection label="Artifacts">
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
          </InformationRow>
        </TaskSection>
      </TaskContent>
      <TaskSidebar>Menu</TaskSidebar>
    </TaskContainer>
  );
};

const TaskContainer = styled.div`
  display: flex;
  padding: 25px 0;
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskSidebar = styled.div`
  flex-basis: 250px;
`;

const StyledCodeBlock = styled.div`
  padding: 15px;
  background: ${(props) => props.theme.color.bg.light};
  border-bottom: 1px solid ${(props) => props.theme.color.border.light};
  border-radius: 4px;
  font-size: 14px;
  white-space: pre-wrap;
`;

//
// Task section presents one title section of task view
//

const TaskSection: React.FC<{ label: string }> = ({ label, children }) => {
  return (
    <TaskSectionContainer>
      <TaskSectionHeader>
        <h3>{label}</h3>
      </TaskSectionHeader>
      <TaskSectionContent>{children}</TaskSectionContent>
    </TaskSectionContainer>
  );
};

const TaskSectionContainer = styled.div`
  margin-bottom: 35px;
`;
const TaskSectionHeader = styled.div`
  padding: 0 15px;
  border-bottom: 1px solid gray;
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
`;

const KeyValueListLabel = styled.div`
  flex-basis: 200px;
`;

export default Task;
