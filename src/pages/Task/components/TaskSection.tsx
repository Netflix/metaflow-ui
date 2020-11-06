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
  // Action buttons for section
  actionbar?: React.ReactNode;
  last?: boolean;
};

const TaskSection: React.FC<Props> = ({
  label,
  sectionkey,
  updatePosition,
  noTitle,
  last = false,
  children,
  actionbar,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const offset = ref?.current?.offsetTop;
    if (offset) {
      updatePosition(offset);
    }
  }, [updatePosition, ref]);

  return (
    <TaskSectionContainer ref={ref} id={sectionkey} last={last}>
      {!noTitle && (
        <TaskSectionHeader>
          <h3>{label}</h3>
          <div>{actionbar && actionbar}</div>
        </TaskSectionHeader>
      )}
      <TaskSectionContent>{children}</TaskSectionContent>
    </TaskSectionContainer>
  );
};

const TaskSectionContainer = styled.div<{ last: boolean }>`
  margin-bottom: ${(p) => (p.last ? '0' : '2rem')};
`;
const TaskSectionHeader = styled.div`
  padding: 0 1rem;
  border-bottom: ${(p) => p.theme.border.thinLight};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0.75rem 0;
  }
`;
const TaskSectionContent = styled.div`
  padding: 15px;
`;

export default TaskSection;
