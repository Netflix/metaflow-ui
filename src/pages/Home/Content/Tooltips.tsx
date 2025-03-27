import React from 'react';
import { TagTooltip } from '@pages/Home/ResultGroup/Cells/TagCell';
import Tooltip from '@components/Tooltip';
import { TriggeredByTooltip } from '@components/Trigger/TriggeredByBadge';

const HomeTooltips: React.FC<{
  updateListValue: (key: string, value: string) => void;
}> = ({ updateListValue }) => {
  return (
    <>
      <TagTooltip updateListValue={updateListValue} />
      <TriggeredByTooltip />
      <Tooltip id="general-table-tooltip" />
    </>
  );
};

export default HomeTooltips;
