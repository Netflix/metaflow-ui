import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, match, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getPath, getRouteMatch, KnownURLParams } from '../../utils/routing';

import Button, { ButtonLink, ButtonCSS, BigButton } from '../Button';
import { TextInputField } from '../Form';
import Icon from '../Icon';
import { PopoverStyles } from '../Popover';
import { ItemRow } from '../Structure';

//
// Component
//

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const history = useHistory();

  const routeMatch = getRouteMatch(location.pathname);
  const buttonList = findAdditionalButtons(routeMatch, location.search);
  const currentBreadcrumbPath = buttonList.map((item) => item.label).join('/');

  const [edit, setEdit] = useState(false);
  const [str, setStr] = useState(currentBreadcrumbPath.replace(/\s/g, ''));
  const [warning, setWarning] = useState('');

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.charCode === 13) {
      // If user presses enter without changing value, lets hide popup
      if ((e.currentTarget.value || '').length > 0 && e.currentTarget.value === currentBreadcrumbPath) {
        closeUp();
      } else {
        const parts = e.currentTarget.value.split('/').filter((item) => item);

        if (parts.length === 0) {
          history.push(getPath.home());
        } else if (parts.length === 1) {
          history.push(getPath.home() + '?flow_id=' + parts[0]);
        } else if (parts.length === 2) {
          history.push(getPath.timeline(parts[0], parts[1]));
        } else if (parts.length === 3) {
          history.push(getPath.step(parts[0], parts[1], parts[2]));
        } else if (parts.length === 4) {
          history.push(getPath.task(parts[0], parts[1], parts[2], parts[3]));
        } else {
          setWarning(t('breadcrumb.no-match'));
        }

        if (parts.length > -1 && parts.length < 5) {
          closeUp();
        }
      }
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeUp();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const closeUp = () => {
    setEdit(false);
    setWarning('');
  };

  const openModal = () => {
    setEdit(true);
    setStr(currentBreadcrumbPath.replace(/\s/g, ''));
  };

  return (
    <StyledBreadcrumb pad="md">
      <ButtonLink
        to={location.pathname === '/' ? '/' + location.search : '/'}
        tabIndex={0}
        data-testid={'home-button'}
        variant="primaryText"
      >
        {t('home.home')}
      </ButtonLink>

      {/* On home page, when not editing breadcrumb */}
      {buttonList.length === 0 && !edit && (
        <BreadcrumbEmptyInput
          horizontal
          placeholder={t('breadcrumb.goto')}
          onClick={openModal}
          onKeyPress={openModal}
          data-testid="breadcrumb-goto-input-inactive"
        />
      )}

      {/* Rendering breadcrumb items when not in home and not editing. */}
      {!edit && buttonList.length > 0 && (
        <>
          <BreadcrumbGroup data-testid="breadcrumb-button-container">
            {buttonList.map(({ label, path }, index) => {
              const isLastItem = index + 1 === buttonList.length;
              return (
                <CrumbComponent key={index}>
                  <ButtonCrumb
                    key={index}
                    textOnly
                    active={isLastItem}
                    title={label}
                    onClick={() => {
                      if (isLastItem) {
                        openModal();
                      } else {
                        history.push(path);
                      }
                    }}
                  >
                    {label}
                  </ButtonCrumb>
                  {!isLastItem && <BreadcrumbDivider />}
                </CrumbComponent>
              );
            })}
            <EditButton
              onClick={openModal}
              onKeyPress={(e) => {
                if (e && e.charCode === 13) {
                  openModal();
                }
              }}
              tabIndex={0}
              textOnly
            >
              <Icon name="pen" size="md" />
            </EditButton>
          </BreadcrumbGroup>
        </>
      )}

      {/* Rendering edit block when active */}
      {edit && (
        <>
          <GoToHolder data-testid="breadcrumb-goto-container">
            <GoToContainer>
              <ItemRow>
                <TextInputField
                  placeholder={t('breadcrumb.goto')}
                  value={str}
                  onKeyPress={onKeyPress}
                  onChange={(e) => {
                    setStr(e?.target.value?.replace(/\s/g, '') || '');
                  }}
                  autoFocus={true}
                />
                <GotoClose onClick={() => closeUp()}>
                  <Icon name="times" size="md" />
                </GotoClose>
              </ItemRow>
              <BreadcrumbInfo>
                {warning && <BreadcrumbWarning>{warning}</BreadcrumbWarning>}
                <BreadcrumbKeyValueList
                  items={[
                    { key: t('items.flow'), value: t('breadcrumb.example-flow') },
                    { key: t('items.run'), value: t('breadcrumb.example-run') },
                    { key: t('items.step'), value: t('breadcrumb.example-step') },
                    { key: t('items.task'), value: t('breadcrumb.example-task') },
                  ]}
                />
              </BreadcrumbInfo>
            </GoToContainer>
          </GoToHolder>

          <ModalOutsideClickDetector onClick={() => closeUp()} />
        </>
      )}
    </StyledBreadcrumb>
  );
};

const BreadcrumbKeyValueList: React.FC<{ items: { key: string; value: string }[] }> = ({ items }) => (
  <div>
    {items.map(({ key, value }) => (
      <KeyValueListItem key={key}>
        <KeyValueListLabel>{key}</KeyValueListLabel>
        <KeyValueListValue>{value}</KeyValueListValue>
      </KeyValueListItem>
    ))}
  </div>
);

//
// Utils
//

type BreadcrumbButtons = { label: string; path: string };

/**
 * Find need for various buttons in breadcrumb. This is now very attached to fixed urls we have now
 * so we might need to make this more generic later.
 * @param routeMatch
 * @param location
 */
export function findAdditionalButtons(routeMatch: match<KnownURLParams> | null, location: string): BreadcrumbButtons[] {
  if (routeMatch === null) return [];
  const queryParams = new URLSearchParams(location);
  const buttons = [];
  const params = routeMatch.params;

  const flowValue = queryParams.get('flow_id') || params.flowId;
  if (flowValue && flowValue.split(',').length === 1) {
    buttons.push({
      label: `${flowValue}`,
      path: getPath.home() + '?flow_id=' + flowValue,
    });
  }

  if (params.flowId && params.runNumber) {
    buttons.push({
      label: `${params.runNumber}`,
      path: getPath.timeline(params.flowId, params.runNumber),
    });
  }

  // Special case since step name might be found from route params or query params.
  const stepValue = queryParams.get('steps') || params.stepName;
  if (params.flowId && params.runNumber && stepValue) {
    buttons.push({
      label: stepValue,
      path: getPath.step(params.flowId, params.runNumber, stepValue || 'undefined'),
    });
  }

  if (params.flowId && params.runNumber && params.stepName && params.taskId) {
    buttons.push({
      label: params.taskId,
      path: getPath.task(params.flowId, params.runNumber, params.stepName, params.taskId),
    });
  }

  return buttons;
}

//
// Styles
//

const BreadcrumbGroup = styled.div`
  ${ButtonCSS}
  border-color: ${(p) => p.theme.color.text.blue};
`;

const BreadcrumbEmptyInput = styled(TextInputField)``;

const CrumbComponent = styled.div`
  white-space: nowrap;

  &:first-child {
    padding-left: 0.25rem;
  }
`;

const ButtonCrumb = styled(BigButton)`
  display: inline-block;

  padding-left: ${(p) => p.theme.spacer.sm}rem;
  padding-right: ${(p) => p.theme.spacer.sm}rem;
  color: ${(p) => p.theme.color.text.dark};

  overflow-x: hidden;
  max-width: 300px;
  text-overflow: ellipsis;
  background: transparent;

  &.active {
    background: transparent;
  }

  &:hover {
    background-color: transparent;
    color: ${(p) => p.theme.color.text.dark};
  }
`;

const BreadcrumbDivider = styled.div`
  display: inline-block;
  pointer-events: none;
  color: ${(p) => p.theme.color.text.dark};
  font-weight: bold;
  &:after {
    content: '/';
  }
  z-index: 1;
`;

const EditButton = styled(Button)`
  background: transparent;
  height: 38px;

  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: 0.25rem;

  border-left: ${(p) => p.theme.border.thinPrimary};

  &:hover {
    border-left: ${(p) => p.theme.border.thinPrimary};
    background: transparent;
  }

  .icon {
    height: 1.5rem;
  }
`;

const StyledBreadcrumb = styled(ItemRow)`
  font-size: 0.875rem;

  .button {
    font-size: 0.875rem;
  }

  input[type='text'] {
    line-height: 1.875rem;
    font-size: 0.875rem;
    width: 35rem;
    border: ${(p) => p.theme.border.thinPrimary};
    background: #fff;
    padding-left: 0.5rem;

    &:hover {
      border: ${(p) => p.theme.border.thinPrimary};
    }
  }
`;

const GoToHolder = styled.div`
  position: relative;
  font-size: 0.875rem;
  height: 2rem;
  margin-top: -9px;
  z-index: 2;
`;

const GoToContainer = styled.div`
  position: absolute;
  top: -${(p) => p.theme.spacer.sm}rem;
  left: -${(p) => p.theme.spacer.sm}rem;
  ${PopoverStyles}
`;

const GotoClose = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const BreadcrumbInfo = styled.div`
  padding: ${(p) => p.theme.spacer.sm}rem;
`;

const BreadcrumbWarning = styled.div`
  color: ${(p) => p.theme.notification.danger.text};
`;

const KeyValueListLabel = styled.div`
  color: ${(p) => p.theme.color.text.mid};
  width: 75px;
`;

const KeyValueListValue = styled.div`
  color: ${(p) => p.theme.color.text.dark};
`;

const KeyValueListItem = styled.div`
  display: flex;
  padding: 5px 0;
`;

const ModalOutsideClickDetector = styled.div`
  position: fixed;
  zindex: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

export default Breadcrumb;
