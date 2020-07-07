import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, matchPath, Link, match, useHistory } from 'react-router-dom';
import { PATHS, PathDefinition, getPath } from '../../utils/routing';
import Button, {
  ButtonContainer,
  ButtonContainerItem,
  ButtonContainerSeparator,
  ButtonContainerHighlightedItem,
  ButtonLinkContainer,
} from '../Button';
import Icon from '../Icon';
import { PopoverStyles } from '../Popover';
import { useTranslation } from 'react-i18next';

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

  if (params.flowId && params.runNumber) {
    buttons.push({
      label: `${params.flowId}/${params.runNumber}`,
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

        if (parts.length === 2) {
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
    <StyledBreadcrumb>
      <Button to="/" disabled={buttonList.length === 0} tabIndex={0} testid={'home-button'} label={t('home.home')} />

      {/* On home page, when not editing breadcrumb */}
      {buttonList.length === 0 && !edit && (
        <StyledInput
          style={{ marginLeft: '10px' }}
          onClick={() => setEdit(true)}
          onKeyPress={() => setEdit(true)}
          defaultValue={t('breadcrumb.goto') as string}
          data-testid="breadcrumb-goto-input-inactive"
        />
      )}

      {/* Rendering breadcrumb items when not in home and not editing. */}
      {!edit && buttonList.length > 0 && (
        <ButtonContainer data-testid="breadcrumb-button-container">
          {buttonList.map(({ label, path }, index) => {
            const element = <ButtonContainerItem active={index + 1 === buttonList.length}>{label}</ButtonContainerItem>;

            return (
              <div key={index} style={{ display: 'flex' }}>
                {index + 1 !== buttonList.length ? (
                  <ButtonLinkContainer>
                    <Link to={path}>{element}</Link>
                  </ButtonLinkContainer>
                ) : (
                  element
                )}
                {index + 1 !== buttonList.length ? <ButtonContainerSeparator>|</ButtonContainerSeparator> : ''}
              </div>
            );
          })}
          <ButtonContainerHighlightedItem
            onClick={() => setEdit(true)}
            onKeyPress={(e) => {
              if (e.charCode === 13) {
                setEdit(true);
              }
            }}
            tabIndex={0}
          >
            <Icon name="pen" size="lg" />
          </ButtonContainerHighlightedItem>
        </ButtonContainer>
      )}

      {/* Rendering edit block when active */}
      {edit && (
        <GoToHolder data-testid="breadcrumb-goto-container">
          <GoToContainer>
            <div style={{ display: 'flex' }}>
              <StyledInput
                placeholder={t('breadcrumb.whereto')}
                defaultValue={currentBreadcrumbPath}
                onKeyPress={onKeyPress}
                autoFocus={true}
              />
              <GotoClose onClick={() => closeUp()}>
                <Icon name="times" size="lg" />
              </GotoClose>
            </div>
            <BreadcrumbInfo>
              {warning && <BreadcrumbWarning>{warning}</BreadcrumbWarning>}
              <BreadcrumbHelpLabel>Example:</BreadcrumbHelpLabel>
              <BreadcrumbKeyValueList
                items={[
                  { key: t('items.run'), value: t('breadcrumb.example-run') },
                  { key: t('items.step'), value: t('breadcrumb.example-step') },
                  { key: t('items.task'), value: t('breadcrumb.example-task') },
                ]}
              />
            </BreadcrumbInfo>
          </GoToContainer>
        </GoToHolder>
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

const StyledBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  padding: 0 25px;
  font-size: 14px;
`;

const StyledInput = styled.input`
  flex: 1;
  height: 38px;
  padding: 0 10px;
  line-height: 38px;
  border: ${({ theme }) => '1px solid ' + theme.color.border.light};
  background: ${({ theme }) => '1px solid ' + theme.color.bg.light};
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
  }
`;

const GoToHolder = styled.div`
  position: relative;
  height: 38px;
  font-size: 14px;
`;

const GoToContainer = styled.div`
  position: absolute;
  top: -10px;
  left: 0;
  width: 500px;
  ${PopoverStyles}
`;

const GotoClose = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  cursor: pointer;
`;

const BreadcrumbInfo = styled.div`
  padding: 10px 10px;
`;

const BreadcrumbHelpLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.lightest};
  padding: 10px 0;
`;

const BreadcrumbWarning = styled.div`
  color: ${({ theme }) => theme.notification.danger.text};
`;

const KeyValueListLabel = styled.div`
  color: ${({ theme }) => theme.color.text.mid};
  width: 75px;
`;

const KeyValueListValue = styled.div`
  color: ${({ theme }) => theme.color.text.dark};
`;

const KeyValueListItem = styled.div`
  display: flex;
  padding: 5px 0;
`;

export default Breadcrumb;
