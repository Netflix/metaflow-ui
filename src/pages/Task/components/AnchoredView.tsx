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
  noTitle?: boolean;
  component: React.ReactNode;
};

type AnchoredViewProps = {
  header?: JSX.Element;
  sections: AnchoredViewSection[];
};

const AnchoredView: React.FC<AnchoredViewProps> = ({ sections, header }) => {
  const [sectionPositions, setSectionPositions] = useState<Record<number, number>>({});

  return (
    <AnchoredViewContainer>
      <TaskContent>
        {header}
        {sections.map((section, index) => (
          <TaskSection
            key={section.key}
            label={section.label}
            sectionkey={section.key}
            noTitle={section.noTitle}
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

      <AnchorMenu
        items={sections.map(({ key, label }, index) => ({ key, label, position: sectionPositions[index] }))}
      />
    </AnchoredViewContainer>
  );
};

const AnchoredViewContainer = styled.div`
  display: flex;
  padding: 0.75rem 0;
  width 100%;
`;

const TaskContent = styled.div`
  flex: 1;

  padding: 0 2rem 0 1rem;
`;

export default AnchoredView;
