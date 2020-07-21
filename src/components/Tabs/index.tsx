import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface TabDefinition {
  // Unique key
  key: string;
  // Label to be shown
  label: string;
  // If linkTo is given, click elements will be links instead
  linkTo?: string;
  // Component to be rendered when active
  component: React.ReactNode;
  temporary?: boolean;
}

interface TabsProps {
  // Key of active tab
  activeTab: string;
  // Definition of tabs
  tabs: TabDefinition[];
  widen?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, widen }) => {
  // Using internal state & effect here to track active tab so component can be used as
  // standalone OR controlled component. I imagine we need to use it as controlled in most cases
  // since we want perma urls
  const [active, setActive] = useState(activeTab);
  useEffect(() => {
    setActive(activeTab);
  }, [activeTab]);

  const activeDef = tabs.find((t) => t.key === active);

  return (
    <TabsContainer>
      <TabsHeading widen={widen}>
        {tabs.map((tab) =>
          tab.linkTo ? (
            <Link to={tab.linkTo} key={tab.key} className={tab.key === active ? 'active' : ''}>
              <TabsHeadingItem active={tab.key === active} temporary={tab.temporary}>
                {tab.label}
              </TabsHeadingItem>
            </Link>
          ) : (
            <TabsHeadingItem
              active={tab.key === active}
              onClick={() => setActive(tab.key)}
              key={tab.key}
              temporary={tab.temporary}
            >
              {tab.label}
            </TabsHeadingItem>
          ),
        )}
      </TabsHeading>

      <ActiveTab>{activeDef && activeDef.component}</ActiveTab>
    </TabsContainer>
  );
};

/**
 * Style
 */

const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TabsHeading = styled.div<{ widen?: boolean }>`
  display: flex;
  border-bottom: 2px solid ${(p) => p.theme.color.border.light};
  margin: ${(p) => (p.widen ? '0 -3rem' : 'initial')};
  padding: ${(p) => (p.widen ? '0 3rem' : 'initial')};
  color: ${(p) => p.theme.color.text.mid};

  a {
    color: ${(p) => p.theme.color.text.mid};
    text-decoration: none;

    &.active {
      color: ${(p) => p.theme.color.text.dark};
    }
  }
`;

const TabsHeadingItem = styled.div<{ active: boolean; temporary?: boolean }>`
  margin-right: 1rem;
  margin-bottom: -2px;
  padding 1rem;
  border-top-left-radius: ${(p) => (p.temporary ? '4px' : 'none')};
  border-top-right-radius: ${(p) => (p.temporary ? '4px' : 'none')};
  border-bottom: 2px solid ${(p) => (p.active ? p.theme.color.bg.blue : p.theme.color.border.mid)};
  background: ${(p) => (p.temporary ? p.theme.color.bg.blueLight : 'transparent')};
  font-weight: ${(p) => (p.active ? '600' : 'normal')};
`;

const ActiveTab = styled.div`
  padding-top: 1rem;
  flex: 1 1;
`;

export default Tabs;
