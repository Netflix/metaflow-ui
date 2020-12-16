import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export interface TabDefinition {
  // Unique key
  key: string;
  // Label to be shown
  label: string;
  // If linkTo is given, click elements will be links instead
  linkTo?: string;
  // Component to be rendered when active
  component?: React.ReactNode;
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
            <Link
              to={tab.linkTo}
              key={tab.key}
              className={tab.key === active ? 'active' : ''}
              data-testid="tab-heading-item"
            >
              <TabsHeadingItem active={tab.key === active} temporary={tab.temporary}>
                {tab.label}
              </TabsHeadingItem>
            </Link>
          ) : (
            <TabsHeadingItem
              active={tab.key === active}
              onClick={() => tab.component && setActive(tab.key)}
              key={tab.key}
              temporary={tab.temporary}
              data-testid="tab-heading-item"
            >
              {tab.label}
            </TabsHeadingItem>
          ),
        )}
      </TabsHeading>

      <ActiveTab data-testid="tab-active-content">{activeDef && activeDef.component}</ActiveTab>
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

export const TabsHeading = styled.div<{ widen?: boolean }>`
  display: flex;
  border-bottom: ${(p) => p.theme.border.mediumLight};
  margin: ${(p) => (p.widen ? `0 -${p.theme.layout.pagePaddingX}rem` : 'initial')};
  padding: ${(p) => (p.widen ? `0 ${p.theme.layout.pagePaddingX}rem` : 'initial')};
  color: ${(p) => p.theme.color.text.mid};

  a {
    color: ${(p) => p.theme.color.text.mid};
    text-decoration: none;

    &.active {
      color: ${(p) => p.theme.color.text.dark};
    }
  }
`;

export const TabsHeadingItem = styled.div<{ active: boolean; temporary?: boolean }>`
  margin-right: ${(p) => p.theme.spacer.md}rem;
  margin-bottom: -2px;
  padding: ${(p) => p.theme.spacer.sm}rem ${(p) => p.theme.spacer.md}rem;
  border-top-left-radius: ${(p) => (p.temporary ? '0.25rem' : 'none')};
  border-top-right-radius: ${(p) => (p.temporary ? '0.25rem' : 'none')};
  border-bottom: 2px solid ${(p) => (p.active ? p.theme.color.bg.blue : p.theme.color.border.mid)};
  background: ${(p) =>
    p.temporary && p.active ? p.theme.color.bg.blueLight : p.temporary ? '#f6f6f6' : 'transparent'};
  font-weight: ${(p) => (p.active ? '500' : '400')};
  cursor: pointer;
  transition: 0.15s border;

  &:hover {
    border-bottom-color: ${(p) => p.theme.color.bg.blue};
    font-weight: 500;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
`;

const ActiveTab = styled.div`
  display: flex;
  padding-top: ${(p) => p.theme.spacer.sm}rem;
  flex: 1 1;
`;

export default Tabs;
