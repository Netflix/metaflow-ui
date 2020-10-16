import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

//
// Task section presents one title section of task view
//

type Props = {
  // Visible title for the section
  label: string;
  sectionkey: string;
  // Should title be hidden?
  noTitle?: boolean;
  // Notify absolute position to parent
  updatePosition: (offsetTop: number) => void;
};

const TaskSection: React.FC<Props> = ({ label, sectionkey, updatePosition, noTitle, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const offset = ref?.current?.offsetTop;
    if (offset) {
      updatePosition(offset);
    }
  }, [updatePosition, ref]);

  return (
    <TaskSectionContainer ref={ref} id={sectionkey}>
      {!noTitle && (
        <TaskSectionHeader>
          <h3>{label}</h3>
        </TaskSectionHeader>
      )}
      <TaskSectionContent>{children}</TaskSectionContent>
    </TaskSectionContainer>
  );
};

const TaskSectionContainer = styled.div`
  margin-bottom: 2rem;
`;
const TaskSectionHeader = styled.div`
  padding: 0 1rem;
  border-bottom: ${(p) => p.theme.border.thinLight};

  h3 {
    margin: 0.75rem 0;
  }
`;
const TaskSectionContent = styled.div`
  padding: 15px;
`;

export default TaskSection;
