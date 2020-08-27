import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, matchPath, match, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PATHS, PathDefinition, getPath } from '../../utils/routing';

import Button, { ButtonLink } from '../Button';
import ButtonGroup from '../ButtonGroup';
import { TextInputField } from '../Form';
import Icon from '../Icon';
import { PopoverStyles } from '../Popover';
import { ItemRow } from '../Structure';

type KnownParams = {
  flowId?: string;
  runNumber?: string;
  stepName?: string;
  taskId?: string;
};

type BreadcrumbButtons = { label: string; path: string };

/**
 * Find need for various buttons in breadcrumb. This is now very attached to fixed urls we have now
 * so we might need to make this more generic later.
 * @param routeMatch
 * @param location
 */
export function findAdditionalButtons(routeMatch: match<KnownParams> | null, location: string): BreadcrumbButtons[] {
  if (routeMatch === null) return [];
  const queryParams = new URLSearchParams(location);
  const buttons = [];
  const params = routeMatch.params;

  if (params.flowId) {
    buttons.push({
      label: `${params.flowId}`,
      path: getPath.home() + '?flow_id=' + params.flowId,
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

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const history = useHistory();

  const routeMatch = matchPath<KnownParams>(
    location.pathname,
    Object.keys(PATHS).map((key) => PATHS[key as keyof PathDefinition]),
  );

  const buttonList = findAdditionalButtons(routeMatch, location.search);
  const currentBreadcrumbPath = buttonList.map((item) => item.label).join('/');

  const [edit, setEdit] = useState(false);
  const [lastRoute, setLastRoute] = useState(currentBreadcrumbPath);
  const [warning, setWarning] = useState('');

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.charCode === 13) {
      // If user presses enter without changing value, lets hide popup
      if (e.currentTarget.value === lastRoute) {
        closeUp();
      } else {
        setLastRoute(e.currentTarget.value);
        const parts = e.currentTarget.value.split('/').filter((item) => item);

        if (parts.length === 1) {
          history.replace(getPath.home() + '?flow_id=' + parts[0]);
        } else if (parts.length === 2) {
          history.replace(getPath.timeline(parts[0], parts[1]));
        } else if (parts.length === 3) {
          history.replace(getPath.step(parts[0], parts[1], parts[2]));
        } else if (parts.length === 4) {
          history.replace(getPath.task(parts[0], parts[1], parts[2], parts[3]));
        } else {
          setWarning(t('breadcrumb.no-match'));
        }
      }
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
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

  return (
    <StyledBreadcrumb pad="md">
      <ButtonLink to="/" disabled={buttonList.length === 0} tabIndex={0} data-testid={'home-button'}>
        {t('home.home')}
      </ButtonLink>

      {/* On home page, when not editing breadcrumb */}
      {buttonList.length === 0 && !edit && (
        <TextInputField
          horizontal
          placeholder={t('breadcrumb.goto')}
          onClick={() => setEdit(true)}
          onKeyPress={() => setEdit(true)}
          data-testid="breadcrumb-goto-input-inactive"
        />
      )}

      {/* Rendering breadcrumb items when not in home and not editing. */}
      {!edit && buttonList.length > 0 && (
        <ButtonGroup data-testid="breadcrumb-button-container">
          {buttonList.map(({ label, path }, index) => (
            <ButtonLink key={index} to={path} active={index + 1 === buttonList.length}>
              {label}
            </ButtonLink>
          ))}
          <EditButton
            onClick={() => setEdit(true)}
            onKeyPress={(e) => {
              if (e && e.charCode === 13) {
                setEdit(true);
              }
            }}
            tabIndex={0}
          >
            <Icon name="pen" size="md" />
          </EditButton>
        </ButtonGroup>
      )}

      {/* Rendering edit block when active */}
      {edit && (
        <>
          <GoToHolder data-testid="breadcrumb-goto-container">
            <GoToContainer>
              <ItemRow pad="md">
                <TextInputField
                  placeholder={t('breadcrumb.goto')}
                  defaultValue={currentBreadcrumbPath}
                  onKeyPress={onKeyPress}
                  autoFocus={true}
                />
                <GotoClose onClick={() => closeUp()}>
                  <Icon name="times" size="md" />
                </GotoClose>
              </ItemRow>
              <BreadcrumbInfo>
                {warning && <BreadcrumbWarning>{warning}</BreadcrumbWarning>}
                <BreadcrumbHelpLabel>{t('breadcrumb.example')}:</BreadcrumbHelpLabel>
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

const EditButton = styled(Button)`
  background: #fff;

  .icon {
    height: 1.5rem;
  }
`;

const StyledBreadcrumb = styled(ItemRow)`
  font-size: 0.875rem;

  .button {
    line-height: 1.5rem;
    font-size: 0.875rem;
  }

  input[type='text'] {
    line-height: 1.5rem;
    font-size: 0.875rem;
    width: 20rem;
  }
`;

const GoToHolder = styled.div`
  position: relative;
  font-size: 0.875rem;
  height: 2rem;
  margin-top: -2px;
  z-index: 2;
`;

const GoToContainer = styled.div`
  position: absolute;
  top: -${(p) => p.theme.spacer.sm}rem;
  left: -${(p) => p.theme.spacer.sm}rem;
  width: 24rem;
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

const BreadcrumbHelpLabel = styled.div`
  font-size: 0.75rem;
  color: ${(p) => p.theme.color.text.lightest};
  padding: 10px 0;
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
