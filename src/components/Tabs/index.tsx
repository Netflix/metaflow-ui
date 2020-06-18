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
}

interface TabsProps {
  // Key of active tab
  activeTab: string;
  // Definition of tabs
  tabs: TabDefinition[];
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab }) => {
  // Using internal state & effect here to track active tab so component can be used as
  // standalone OR controlled component. I imagine we need to use it as controlled in most cases
  // since we want perma urls
  const [active, setActive] = useState(activeTab);
  useEffect(() => {
    setActive(activeTab);
  }, [activeTab]);

  const activeDef = tabs.find((t) => t.key === active);

  return (
    <div className="tabs">
      <TabsHeading>
        {tabs.map((tab) =>
          tab.linkTo ? (
            <Link to={tab.linkTo} key={tab.key}>
              <TabsHeadingItem active={tab.key === active}>{tab.label}</TabsHeadingItem>
            </Link>
          ) : (
            <TabsHeadingItem active={tab.key === active} onClick={() => setActive(tab.key)} key={tab.key}>
              {tab.label}
            </TabsHeadingItem>
          ),
        )}
      </TabsHeading>

      {activeDef && activeDef.component}
    </div>
  );
};

/**
 * Style
 */

const TabsHeading = styled.div`
  display: flex;
`;

const TabsHeadingItem = styled.div`
  padding: 10px;

  border-bottom: ${(props: { active: boolean }) => (props.active ? '2px solid blue' : 'none')};
`;

export default Tabs;
