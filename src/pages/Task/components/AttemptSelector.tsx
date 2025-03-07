import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { useTranslation } from 'react-i18next';
import { Task } from '@/types';
import { TabsHeading, TabsHeadingItem } from '@components/Tabs';

//
// Typedef
//

type Props = {
  tasks: Task[] | null;
  currentAttempt: number;
  onSelect: (attempt: string | null) => void;
};

//
// Component
//

const AttemptSelector: React.FC<Props> = ({ tasks, currentAttempt, onSelect }) => {
  const { t } = useTranslation();
  if (tasks === null) return null;
  return (
    <Scrollbars style={{ width: '100%' }} autoHeight autoHide>
      <TabsHeading>
        {tasks.sort(sortTaskAttempts).map((item: Task, index) => (
          <TabsHeadingItem
            key={index}
            onClick={() => onSelect(typeof item.attempt_id === 'number' ? item.attempt_id.toString() : null)}
            active={item.attempt_id === currentAttempt}
            data-testid={`attempt-tab-${index}`}
          >
            {t('task.attempt')} {item.attempt_id}
          </TabsHeadingItem>
        ))}
      </TabsHeading>
    </Scrollbars>
  );
};

//
// Utils
//

const sortTaskAttempts = (a: Task, b: Task) => a.attempt_id - b.attempt_id;

export default AttemptSelector;
