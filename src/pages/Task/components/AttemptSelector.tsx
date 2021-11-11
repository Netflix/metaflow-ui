import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { useTranslation } from 'react-i18next';
import { TabsHeading, TabsHeadingItem } from '../../../components/Tabs';
import { Task } from '../../../types';

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
    <Scrollbars style={{ height: '2.875rem', width: '100%' }} autoHide>
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
