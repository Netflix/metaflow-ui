import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

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

export default TaskSection;
