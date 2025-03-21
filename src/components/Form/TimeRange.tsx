import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import spacetime from 'spacetime';
import styled from 'styled-components';
import { BigButton } from '@components/Button';
import DateInput from '@components/Form/DateInput';
import Dropdown from '@components/Form/Dropdown';
import { InputLabel } from '@components/Form/InputLabel';
import InputWrapper from '@components/Form/InputWrapper';
import Icon from '@components/Icon';
import Popover from '@components/Popover';
import { TimezoneContext } from '@components/TimezoneProvider';
import useOnKeyPress from '@hooks/useOnKeyPress';
import { isFirefox } from '@utils/browser';
import { getDateTimeLocalString, getTimeFromPastByDays } from '@utils/date';

//
// Typedef
//

type TimeRangeProps = {
  onSubmit: (obj: { start: number | null; end: number | null }) => void;
  sectionLabel: string;
  onChange?: (k: string) => void;
  initialValues?: [number | null, number | null];
};

//
// Component
//

const TimeRange: React.FC<TimeRangeProps> = ({ sectionLabel, onSubmit, initialValues }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [values, setValues] = useState<{ start: number | null; end: number | null }>({
    start: initialValues ? initialValues[0] : null,
    end: initialValues ? initialValues[1] : null,
  });
  const [selectedPreset, setPreset] = useState<string>('none');
  const { timezone } = useContext(TimezoneContext);

  useOnKeyPress('Escape', () => setShow(false));

  const HandleSubmit = () => {
    onSubmit({
      start: values.start,
      end: values.end,
    });
    setShow(false);
  };

  return (
    <TimeRangeContainer>
      <InputWrapper status={'Ok'} active={show} onClick={() => setShow(!show)}>
        {sectionLabel && (
          <InputLabel active={false} status={'Ok'}>
            {sectionLabel}
          </InputLabel>
        )}
        <TimeRangeInputContainer>
          <SubmitIconHolder data-testid="filter-input-submit-button" focus={show}>
            <Icon name="calendar" size="sm" />
          </SubmitIconHolder>
        </TimeRangeInputContainer>
      </InputWrapper>
      <Popover show={show}>
        {show && (
          <>
            <Dropdown
              label="Preset"
              value={selectedPreset}
              options={[
                ['none', t('date.select-preset')],
                ['month', t('date.month')],
                ['twoweek', t('date.twoweeks')],
                ['yesterday', t('date.yesterday')],
                ['today', t('date.today')],
              ]}
              onChange={(e) => {
                const val = e?.target?.value;
                if (val) {
                  setPreset(val);
                }

                if (val === 'month') {
                  setValues({ start: getTimeFromPastByDays(30, timezone), end: null });
                } else if (val === 'twoweek') {
                  setValues({ start: getTimeFromPastByDays(14, timezone), end: null });
                } else if (val === 'yesterday') {
                  setValues({ start: getTimeFromPastByDays(1, timezone), end: getTimeFromPastByDays(0, timezone) });
                } else if (val === 'today') {
                  setValues({ start: getTimeFromPastByDays(0, timezone), end: null });
                }
              }}
            />

            <DateInput
              inputType="datetime-local"
              tip={isFirefox ? 'YYYY-MM-DD HH:mm' : undefined}
              onSubmit={HandleSubmit}
              label={t('component.startTime')}
              initialValue={values.start ? getDateTimeLocalString(new Date(values.start), timezone) : undefined}
              onChange={(value) => {
                setValues((vals) => ({ ...vals, start: value ? spacetime(value, timezone).epoch : null }));
              }}
            />
            <DateInput
              inputType="datetime-local"
              tip={isFirefox ? 'YYYY-MM-DD HH:mm' : undefined}
              onSubmit={HandleSubmit}
              label={t('component.endTime')}
              initialValue={values.end ? getDateTimeLocalString(new Date(values.end), timezone) : undefined}
              onChange={(value) => {
                setValues((vals) => ({ ...vals, end: value ? spacetime(value, timezone).epoch : null }));
              }}
            />
          </>
        )}

        <PopoverButtons>
          <TimeRangeButton
            shaded={true}
            onClick={() => {
              setShow(false);
              setPreset('none');
            }}
          >
            {t('component.cancel')}
          </TimeRangeButton>
          <TimeRangeButton
            shaded={false}
            onClick={() => {
              onSubmit({
                start: values.start,
                end: values.end,
              });
              setShow(false);
              setPreset('none');
            }}
          >
            {t('component.set')}
          </TimeRangeButton>
        </PopoverButtons>
      </Popover>
    </TimeRangeContainer>
  );
};

//
// Styles
//

const TimeRangeContainer = styled.div`
  position: relative;
  .popover {
    top: 100%;
    margin-top: 0.375rem;
    width: 100%;

    > section {
      margin-bottom: 0.75rem;
    }
  }
`;

const TimeRangeInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SubmitIconHolder = styled.div<{ focus: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  transform: translateY(-50%);

  &:hover {
    svg {
      color: var(--color-text-highlight);
    }
  }
`;

const PopoverButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
`;

const TimeRangeButton = styled(BigButton)<{ shaded: boolean }>`
  line-height: 1.625rem;
  background: ${(p) => (p.shaded ? '#f6f6f6' : '#fff')};
`;

export default TimeRange;
