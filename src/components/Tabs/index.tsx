import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars-2';

export interface TabDefinition {
  // Unique key
  key: string;
  // Label to be shown
  label: React.ReactNode;
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
      <Scrollbars style={{ height: '2.875rem', width: '100%' }} autoHide>
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
      </Scrollbars>

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
  border-bottom: var(--border-1-medium);
  margin: ${(p) => (p.widen ? '0 calc(var(--layout-page-padding-y) * -1)' : 'initial')};
  padding: ${(p) => (p.widen ? '0 var(--layout-page-padding-x)' : 'initial')};
  color: var(--color-text-secondary);

  a {
    color: var(--color-text-secondary);
    text-decoration: none;

    &.active {
      color: var(--color-text-primary);
    }
  }
`;

export const TabsHeadingItem = styled.div<{ active: boolean; temporary?: boolean }>`
  margin-right: var(--spacing-7);
  margin-bottom: -2px;
  padding: var(--spacing-3) var(--spacing-7);
  border-top-left-radius: ${(p) => (p.temporary ? '0.25rem' : 'none')};
  border-top-right-radius: ${(p) => (p.temporary ? '0.25rem' : 'none')};
  border-bottom: 2px solid ${(p) => (p.active ? 'var(--color-bg-secondary-highlight)' : 'transparent')};
  background: ${(p) =>
    p.temporary && p.active ? 'var(--color-bg-secondary-highlight)' : p.temporary ? '#f6f6f6' : 'transparent'};
  color: ${(p) => (p.active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)')};
  font-weight: ${(p) => (p.active ? '500' : '400')};
  cursor: pointer;
  transition: 0.15s border;
  white-space: nowrap;

  &:hover {
    border-bottom-color: var(--color-bg-brand-primary);
    font-weight: 500;
    border-top-left-radius: var(--radius-primary);
    border-top-right-radius: var(--radius-primary);
  }
`;

const ActiveTab = styled.div`
  display: flex;
  padding-top: var(--spacing-3);
  flex: 1 1;
`;

export default Tabs;
