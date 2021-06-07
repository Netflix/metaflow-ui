import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckboxField } from '../../../components/Form';
import { Section, SectionHeader } from '../../../components/Structure';

//
// Typedef
//

type Props = {
  updateField: (key: string, value: string) => void;
  status?: string | null;
};

const SidebarStatusSelection: React.FC<Props> = ({ updateField, status }) => {
  const { t } = useTranslation();
  return (
    <Section>
      <SectionHeader>{t('fields.status')}</SectionHeader>
      <StatusCheckboxField
        label={t('filters.running')}
        value="running"
        activeStatus={status}
        updateField={updateField}
      />
      <StatusCheckboxField label={t('filters.failed')} value="failed" activeStatus={status} updateField={updateField} />
      <StatusCheckboxField
        label={t('filters.completed')}
        value="completed"
        activeStatus={status}
        updateField={updateField}
      />
    </Section>
  );
};

//
// Status field
//

type StatusFieldProps = {
  value: string;
  label: string;
  updateField: (key: string, value: string) => void;
  activeStatus?: string | null;
};

const StatusCheckboxField: React.FC<StatusFieldProps> = ({ value, label, updateField, activeStatus }) => {
  return (
    <CheckboxField
      label={label}
      className={`status-${value}`}
      checked={!!(activeStatus && activeStatus.indexOf(value) > -1)}
      onChange={() => {
        updateField('status', value);
      }}
    />
  );
};

export default SidebarStatusSelection;
