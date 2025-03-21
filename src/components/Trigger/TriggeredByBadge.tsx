import React from 'react';
import styled from 'styled-components';
import Tooltip from '@/components/Tooltip';
import { TriggerEventsValue } from '@/components/Trigger';

type TriggerBadgeInfo =
  | {
      type: 'user';
      data: string;
    }
  | { type: 'trigger'; data: TriggerEventsValue[] };

type Props = {
  id: number;
  content: TriggerBadgeInfo;
};

const TriggeredByBadge: React.FC<Props> = ({ id, content }) => {
  const tooltipId = `trigger-tooltip-${id}`;

  if (content.type === 'user') {
    return (
      <>
        <Badge badgeType="user" data-tip data-for={tooltipId}>
          {content.data}
        </Badge>
        <Tooltip id={tooltipId} place="bottom">
          <div>{content.data}</div>
        </Tooltip>
      </>
    );
  }

  return (
    <Badges>
      {content.data.slice(0, 1).map((item) => (
        <Badge key={item.name} badgeType={item.type} data-tip data-for={tooltipId}>
          {item.name}
        </Badge>
      ))}
      {content.data.length > 1 && (
        <Badge badgeType="event" data-tip data-for={tooltipId}>
          +{content.data.length - 1}
        </Badge>
      )}
      <Tooltip id={tooltipId} place="bottom">
        {content.data.map((item) => (
          <div key={item.name}>{item.name}</div>
        ))}
      </Tooltip>
    </Badges>
  );
};

const Badges = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.25rem;
`;

const Badge = styled.div<{ badgeType: 'user' | 'event' | 'run' }>`
  border: 1px solid;
  border-radius: 6px;
  padding: 0.25rem;
  border-color: ${(p) => (p.badgeType === 'run' ? '#4E7CA766' : '#6A68674D')};
  color: var(--color-text-light);
  text-overflow: ellipsis;
  width: max-content;
  max-width: 13rem;
  white-space: nowrap;
  overflow: hidden;
`;

export default TriggeredByBadge;
