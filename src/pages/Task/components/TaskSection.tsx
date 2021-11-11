import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { TitledSectionHeader } from '../../../components/TitledSection';

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
      {!noTitle && <TitledSectionHeader label={label} actionbar={actionbar} />}
      <TaskSectionContent>{children}</TaskSectionContent>
    </TaskSectionContainer>
  );
};

const TaskSectionContainer = styled.div<{ last: boolean }>`
  margin-bottom: ${(p) => (p.last ? '0' : '1rem')};
`;

const TaskSectionContent = styled.div`
  padding-top: 0.325rem;
`;

export default TaskSection;
