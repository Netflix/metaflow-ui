import { TFunction } from 'i18next';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import spacetime from 'spacetime';
import styled from 'styled-components';
import Filter from '@components/FilterInput/Filter';
import { FilterClickableRow, FilterSeparator, FilterText } from '@components/FilterInput/FilterRows';
import DateInput from '@components/Form/DateInput';
import HeightAnimatedContainer from '@components/HeightAnimatedContainer';
import Icon from '@components/Icon';
import { TimezoneContext } from '@components/TimezoneProvider';
import { getDateTimeLocalString, getTimeFromPastByDays } from '@utils/date';

export type TimerangeValues = { start: number | null; end: number | null };
type Props = {
  onChange: (values: TimerangeValues) => void;
  value: TimerangeValues;
};

const TimerangeSelection: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { timezone } = useContext(TimezoneContext);
  const labelValue = value.start || value.end ? formatString(value, timezone, t) : null;

  return (
    <div>
      <Filter
        label="Time frame"
        value={labelValue}
        onClear={() => onChange({ start: null, end: null })}
        content={({ onClose }) => (
          <TimeRangePopup label={labelValue} value={value} onChange={onChange} onClose={onClose} />
        )}
      />
    </div>
  );
};

const TimeRangePopup: React.FC<{
  value: TimerangeValues;
  label: string | null;
  onChange: (args: TimerangeValues) => void;
  onClose: () => void;
}> = ({ value, label, onChange }) => {
  const { t } = useTranslation();
  const { timezone } = useContext(TimezoneContext);
  const [customOpen, setCustomOpen] = useState(label === t('date.custom'));

  const presets = [
    { label: t('date.today'), start: getTimeFromPastByDays(0, timezone), end: null },
    { label: t('date.yesterday'), start: getTimeFromPastByDays(1, timezone), end: getTimeFromPastByDays(0, timezone) },
    { label: t('date.twoweeks'), start: getTimeFromPastByDays(14, timezone), end: null },
    { label: t('date.month'), start: getTimeFromPastByDays(30, timezone), end: null },
  ];

  return (
    <div>
      {presets.map((preset) => (
        <FilterClickableRow onClick={() => onChange({ start: preset.start, end: preset.end })} key={preset.label}>
          {preset.label}
        </FilterClickableRow>
      ))}
      <FilterSeparator />
      <FilterClickableRow onClick={() => setCustomOpen(!customOpen)}>
        <CollapseRow>
          <FilterText>{t('filters.custom')}</FilterText>
          <Icon name="chevron" size="xs" rotate={customOpen ? -180 : 0} />
        </CollapseRow>
      </FilterClickableRow>

      <HeightAnimatedContainer>
        {customOpen && (
          <TimerangeFields>
            <DateInput
              inputType="datetime-local"
              onChange={(newValue) =>
                onChange({ ...value, start: newValue ? spacetime(newValue, timezone).epoch : null })
              }
              initialValue={value.start ? getDateTimeLocalString(new Date(value.start), timezone) : undefined}
            />

            <DateInput
              inputType="datetime-local"
              onChange={(newValue) =>
                onChange({ ...value, end: newValue ? spacetime(newValue, timezone).epoch : null })
              }
              initialValue={value.end ? getDateTimeLocalString(new Date(value.end), timezone) : undefined}
            />
          </TimerangeFields>
        )}
      </HeightAnimatedContainer>
    </div>
  );
};

//
// Utils
//

function formatString(value: TimerangeValues, timezone: string, t: TFunction): string {
  const { start, end } = value;
  // Check if selected time is last 30d, last 14d or today
  if (start && !end) {
    if (start === getTimeFromPastByDays(30, timezone)) {
      return t('date.month');
    } else if (start === getTimeFromPastByDays(14, timezone)) {
      return t('date.twoweeks');
    } else if (start === getTimeFromPastByDays(0, timezone)) {
      return t('date.today');
    }
  }
  // Check if yesterday preset was selected
  if (start && end && start === getTimeFromPastByDays(1, timezone) && end === getTimeFromPastByDays(0, timezone)) {
    return t('date.yesterday');
  }

  return t('date.custom');
}

const TimerangeFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CollapseRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default TimerangeSelection;
