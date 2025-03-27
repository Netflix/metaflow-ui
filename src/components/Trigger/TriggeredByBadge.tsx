import React from 'react';
import styled from 'styled-components';
import Tooltip from '@components/Tooltip';
import { TriggerEventsValue } from '@components/Trigger';

type TriggerBadgeInfo =
  | {
      type: 'user';
      data: string;
    }
  | { type: 'trigger'; data: TriggerEventsValue[] };

type Props = {
  content: TriggerBadgeInfo;
};

const TriggeredByBadge: React.FC<Props> = ({ content }) => {
  if (!content.data) {
    return;
  }

  const badges =
    content.type === 'user'
      ? [
          {
            type: 'user' as const,
            name: content.data,
          },
        ]
      : content.data.map((item) => ({ type: item.type, name: item.name }));

  const tooltipProps = {
    'data-tooltip-content': badges.map((item) => item.name).join(', '),
    'data-tooltip-id': 'triggered-by-tooltip',
  };

  return (
    <Badges>
      {badges.slice(0, 1).map((item) => (
        <Badge key={item.name} badgeType={item.type} {...tooltipProps}>
          {item.name}
        </Badge>
      ))}
      {badges.length > 1 && (
        <Badge badgeType="event" {...tooltipProps}>
          +{badges.length - 1}
        </Badge>
      )}
    </Badges>
  );
};

export const TriggeredByTooltip = () => {
  return <Tooltip id="triggered-by-tooltip" place="left" />;
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
