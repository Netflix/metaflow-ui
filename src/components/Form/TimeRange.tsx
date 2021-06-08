import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import { InputLabel } from './InputLabel';
import Popover from '../Popover';
import { BigButton } from '../Button';
import { TimezoneContext } from '../TimezoneProvider';
import { getDateTimeLocalString } from '../../utils/date';
import spacetime from 'spacetime';
import { useTranslation } from 'react-i18next';
import { isFirefox } from '../../utils/browser';
import InputWrapper from './InputWrapper';
import DateInput from './DateInput';

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
  const [values, setValues] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });
  const { timezone } = useContext(TimezoneContext);

  const startValue = initialValues && initialValues[0];
  const endValue = initialValues && initialValues[1];

  useEffect(() => {
    setValues({ start: startValue || null, end: endValue || null });
  }, [startValue, endValue]);

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
            <DateInput
              inputType="datetime-local"
              tip={isFirefox ? 'YYYY-MM-DD HH:mm' : undefined}
              onSubmit={HandleSubmit}
              label={t('component.startTime')}
              initialValue={
                initialValues && initialValues[0]
                  ? getDateTimeLocalString(new Date(initialValues[0]), timezone)
                  : undefined
              }
              onChange={(value) => {
                setValues((vals) => ({ ...vals, start: value ? spacetime(value, timezone).epoch : null }));
              }}
            />
            <DateInput
              inputType="datetime-local"
              tip={isFirefox ? 'YYYY-MM-DD HH:mm' : undefined}
              onSubmit={HandleSubmit}
              label={t('component.endTime')}
              initialValue={
                initialValues && initialValues[1]
                  ? getDateTimeLocalString(new Date(initialValues[1]), timezone)
                  : undefined
              }
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
    top: 2.75rem;
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
      color: ${(p) => p.theme.color.text.blue};
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
