import React, { useState } from 'react';
import styled from 'styled-components';
import AnchorMenu from './AnchorMenu';
import TaskSection from './TaskSection';

//
// Anchored View
//

type AnchoredViewSection = {
  key: string;
  label: string;
  order: number;
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

export default AnchoredView;
