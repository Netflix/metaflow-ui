import React, { ReactNode, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AnchorMenu from '@pages/Task/components/AnchorMenu';
import TaskSection from '@pages/Task/components/TaskSection';
import { getHeaderSizePx } from '@utils/style';

//
// Anchored View
//

export type AnchoredViewSection = {
  key: string;
  label: React.ReactNode | string;
  order: number;
  noTitle?: boolean;
  actionbar?: React.ReactNode;
  component: React.ReactNode;
};

type AnchoredViewProps = {
  header?: JSX.Element;
  activeSection: string | null | undefined;
  setSection: (value: string | null) => void;
  sections: AnchoredViewSection[];
};

const AnchoredView: React.FC<AnchoredViewProps> = ({ sections, header, activeSection, setSection }) => {
  const [sectionPositions, setSectionPositions] = useState<Record<number, number>>({});
  const [lastSectionHeight, setLastSectionHeight] = useState(0);

  const headerSize = getHeaderSizePx();

  return (
    <AnchoredViewContainer>
      <TaskContent>
        {header}
        {sections.map((section, index) => {
          const isLast = index === sections.length - 1;
          const component = (
            <TaskSection
              key={section.key}
              label={section.label}
              sectionkey={section.key}
              noTitle={section.noTitle}
              actionbar={section.actionbar}
              last={isLast}
              updatePosition={(offsetTop) => {
                const exists = sectionPositions[index];
                if (!exists || (exists && exists !== offsetTop)) {
                  setSectionPositions((cur) => ({ ...cur, [index]: offsetTop }));
                }
              }}
            >
              {section.component}
            </TaskSection>
          );

          return isLast ? (
            <HeightTracker key="last-item-key" updateLastSectionHeight={(num) => setLastSectionHeight(num)}>
              {component}
            </HeightTracker>
          ) : (
            component
          );
        })}
        <div
          style={{
            height:
              lastSectionHeight < window.innerHeight - headerSize
                ? `${window.innerHeight - headerSize - lastSectionHeight}px`
                : 0,
          }}
        />
      </TaskContent>

      <AnchorMenu
        activeSection={activeSection}
        setSection={setSection}
        items={sections.map(({ key, label }, index) => ({ key, label, position: sectionPositions[index] }))}
      />
    </AnchoredViewContainer>
  );
};

const HeightTracker: React.FC<{ children: ReactNode; updateLastSectionHeight: (height: number) => void }> = ({
  children,
  updateLastSectionHeight,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      updateLastSectionHeight(ref.current.clientHeight);
    }
  }, [children, ref, updateLastSectionHeight]);

  useEffect(() => {
    const listener = () => ref && ref.current && updateLastSectionHeight(ref.current.clientHeight);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [updateLastSectionHeight]);

  return <div ref={ref}>{children}</div>;
};

const AnchoredViewContainer = styled.div`
  display: flex;
  width 100%;
`;

const TaskContent = styled.div`
  flex: 1;
  background: var(--task-content-bg);
  border-radius: var(--task-content-border-radius);
  margin: var(--task-content-margin);
  padding: var(--task-content-padding);
  box-shadow: var(--task-content-shadow);
  border-left: var(--task-content-border-left);
  border-right: var(--task-content-border-right);
`;

export default AnchoredView;
