import React, { useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';
import { AsyncStatus } from '../../types';
import { InputLabel } from './InputLabel';
import Popover from '../Popover';
import FilterInput from '../FilterInput';
import { BigButton } from '../Button';
import { TimezoneContext } from '../TimezoneProvider';
import { getDateTimeLocalString } from '../../utils/date';
import spacetime from 'spacetime';
import { useTranslation } from 'react-i18next';
import { isFirefox } from '../../utils/browser';

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
      <TimeRangeWrapper status={'Ok'} active={show} onClick={() => setShow(!show)}>
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
      </TimeRangeWrapper>
      <Popover show={show}>
        {show && (
          <>
            <FilterInput
              inputType="datetime-local"
              tip={isFirefox ? 'YYYY-MM-DD HH:mm' : undefined}
              onSubmit={HandleSubmit}
              sectionLabel={t('component.startTime')}
              noIcon
              noClear
              initialValue={
                initialValues && initialValues[0]
                  ? getDateTimeLocalString(new Date(initialValues[0]), timezone)
                  : undefined
              }
              onChange={(value) => {
                setValues((vals) => ({ ...vals, start: value ? spacetime(value, timezone).epoch : null }));
              }}
            />
            <FilterInput
              inputType="datetime-local"
              tip={isFirefox ? 'YYYY-MM-DD HH:mm' : undefined}
              onSubmit={HandleSubmit}
              sectionLabel={t('component.endTime')}
              noIcon
              noClear
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

const TimeRangeWrapper = styled.section<{ active: boolean; status: AsyncStatus }>`
  align-items: center;
  border: ${(p) => (p.status === 'Error' ? '1px solid ' + p.theme.color.bg.red : p.theme.border.thinLight)};
  border-radius: 0.25rem;
  color: #333;
  display: flex;
  height: 2.5rem;
  padding: 0.5rem 1rem;
  position: relative;
  transition: border 0.15s;
  cursor: ${(p) => (p.active ? 'auto' : 'pointer')};

  &:hover {
    border-color: ${(p) => (p.status === 'Error' ? p.theme.color.bg.red : p.active ? p.theme.color.text.blue : '#333')};
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
  line-height: 1.125rem;
  z-index: 10;
  transform: translateY(-50%);

  i {
    margin: -0.125rem 0 0;
    vertical-align: middle;
  }

  .icon-enter svg {
    color: #fff;
  }

  &:hover {
    ${(p) =>
      p.focus
        ? css`
            svg path {
              stroke: ${p.theme.color.text.blue};
            }
          `
        : css`
            svg {
              color: ${p.theme.color.text.blue};
            }
          `}} 

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
