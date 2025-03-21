import React, { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
      <Scrollbars style={{ height: 'var(--tab-heading-height)', width: '100%' }} autoHide>
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
  border-bottom: var(--tab-heading-border-bottom);
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
  margin: var(--tab-heading-margin);
  padding: var(--tab-heading-padding);
  border-radius: var(--tab-heading-border-radius);
  border-top-left-radius: ${(p) => (p.temporary ? 'var(--radius-primary)' : 'var(--tab-heading-border-radius)')};
  border-top-right-radius: ${(p) => (p.temporary ? 'var(--radius-primary)' : 'var(--tab-heading-border-radius)')};
  border-bottom: ${(p) =>
    p.active ? 'var(--tab-heading-item-active-border-bottom)' : 'var(--tab-heading-item-border-bottom)'};
  background: ${(p) =>
    p.temporary && p.active
      ? 'var(--tab-heading-active-bg)'
      : p.temporary
        ? '#f6f6f6'
        : p.active
          ? 'var(--tab-heading-active-bg)'
          : 'var(--tab-heading-bg)'};
  color: ${(p) => (p.active ? 'var(--tab-heading-active-text-color)' : 'var(--tab-heading-text-color)')};
  font-weight: ${(p) => (p.active ? 'var(--tab-heading-active-font-weight)' : 'var(--tab-heading-font-weight)')};
  cursor: pointer;
  transition: 0.15s border;
  white-space: nowrap;
  font-size: var(--font-size-primary);

  &:hover {
    border-bottom-color: var(--color-bg-brand-primary);
    font-weight: var(--tab-heading-active-font-weight);
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
