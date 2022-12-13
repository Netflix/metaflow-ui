import React, { ChangeEventHandler, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useLocation, match, useHistory, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPath, getRouteMatch, KnownURLParams } from '../../utils/routing';
import Button, { ButtonLink, ButtonCSS, BigButton } from '../Button';
import Icon from '../Icon';
import { PopoverStyles } from '../Popover';
import { ItemRow } from '../Structure';
import useAutoComplete, { AutoCompleteItem } from '../../hooks/useAutoComplete';
import { takeLastSplitFromURL } from '../../utils/url';
import { AutoCompleteLine } from '../AutoComplete';
import HeightAnimatedContainer from '../HeightAnimatedContainer';
import InputWrapper from '../Form/InputWrapper';
import useOnKeyPress from '../../hooks/useOnKeyPress';

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

  const [activeAutoCompleteOption, setActiveOption] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const [str, setStr] = useState(currentBreadcrumbPath.replace(/\s/g, ''));
  const [warning, setWarning] = useState('');

  const autoCompleteUrl = useMemo(() => urlFromString(str), [str]);
  const finder = (item: AutoCompleteItem, input: string) => {
    const last = takeLastSplitFromURL(item.label);
    return !input ? true : last.toLowerCase().includes(input.toLowerCase());
  };
  const autoCompleteParams = useMemo(
    () => ({
      url: autoCompleteUrl.url || '',
      params: autoCompleteUrl.params,
      enabled: !!autoCompleteUrl.url,
      finder,
      input: takeLastSplitFromURL(str),
      searchEmpty: str.split('/').length > 1,
    }),
    [autoCompleteUrl.params, autoCompleteUrl.url, str],
  );

  const { result: autoCompleteResult, reset: resetAutocomplete } = useAutoComplete<string>(autoCompleteParams);

  //
  // Handlers
  //

  //
  // Try to move to given url
  //
  const tryMove = (str: string) => {
    const path = pathFromString(str);

    if (path) {
      localStorage.removeItem('home-params');
      history.push(path);
      closeUp();
    } else {
      setWarning(t('breadcrumb.no-match'));
      closeUp();
    }
  };
  //
  // Handles submitting path on breadcrumb
  //
  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.charCode === 13) {
      if (activeAutoCompleteOption) {
        const item = autoCompleteResult.data.find((r) => r.value === activeAutoCompleteOption);
        if (item) {
          setStr((s) => mergeWithString(s, item.value) + '/');
        }
        setActiveOption(null);
      } // If user presses enter without changing value, lets hide popup
      else if (notEmptyAndEqual(e.currentTarget.value, currentBreadcrumbPath)) {
        closeUp();
      } else {
        tryMove(e.currentTarget.value);
      }
    }
  };
  //
  // Handles movement on suggested routes on autocomplete
  //
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (autoCompleteResult.data.length === 0) {
        return;
      }

      const index = autoCompleteResult.data.findIndex((item) => item.value === activeAutoCompleteOption);
      const newIndex = e.key === 'ArrowDown' ? index + 1 : index - 1;

      if (newIndex < 0 || newIndex > Math.min(3, autoCompleteResult.data.length)) {
        setActiveOption(null);
      } else {
        setActiveOption(autoCompleteResult.data[newIndex].value);
      }
    }
  };

  const closeUp = () => {
    setEdit(false);
    setWarning('');
  };

  const openModal = () => {
    setEdit(true);
    setStr(currentBreadcrumbPath.replace(/\s/g, ''));
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setStr(e?.target.value?.replace(/\s/g, '') || '');
    if (!e?.target.value?.replace(/\s/g, '')) {
      resetAutocomplete();
    }
  };

  const handleFocus = () => {
    resetAutocomplete();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e && e.charCode === 13) {
      openModal();
    }
  };
  //
  // Esc listeners
  //

  useOnKeyPress('Escape', () => closeUp());

  return (
    <StyledBreadcrumb pad="md">
      <ButtonLink
        to={'/'}
        tabIndex={0}
        data-testid={'home-button'}
        variant="primaryText"
        disabled={location.pathname === '/'}
      >
        {t('home.home')}
      </ButtonLink>

      {/* On home page, when not editing breadcrumb */}
      {buttonList.length === 0 && !edit && (
        <BreadcrumbEmptyInput
          active={true}
          onClick={openModal}
          onKeyPress={openModal}
          data-testid="breadcrumb-goto-input-inactive"
        >
          <input placeholder={t('breadcrumb.goto')} />
        </BreadcrumbEmptyInput>
      )}

      {/* Rendering breadcrumb items when not in home and not editing. */}
      {!edit && buttonList.length > 0 && (
        <>
          <BreadcrumbGroup data-testid="breadcrumb-button-container">
            {buttonList.map(({ label, path }, index) => {
              const isLastItem = index + 1 === buttonList.length;
              return (
                <CrumbComponent key={index}>
                  {isLastItem ? (
                    <ButtonCrumb key={index} textOnly active={isLastItem} title={label} onClick={() => openModal()}>
                      {label}
                    </ButtonCrumb>
                  ) : (
                    <Link to={path}>
                      <ButtonCrumb key={index} textOnly active={isLastItem} title={label} onClick={() => null}>
                        {label}
                      </ButtonCrumb>
                    </Link>
                  )}
                  {!isLastItem && <BreadcrumbDivider />}
                </CrumbComponent>
              );
            })}
            <EditButton onClick={openModal} onKeyPress={handleKeyPress} tabIndex={0} textOnly>
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
                <BreadcrumbInputWrapper active={edit}>
                  <input
                    type="text"
                    placeholder={t('breadcrumb.goto')}
                    value={str}
                    onKeyPress={onKeyPress}
                    onKeyDown={onKeyDown}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    autoFocus={true}
                  />
                </BreadcrumbInputWrapper>
                <GotoClose onClick={() => closeUp()}>
                  <Icon name="times" size="md" />
                </GotoClose>
              </ItemRow>
              <HeightAnimatedContainer>
                {autoCompleteResult.status === 'Ok' && autoCompleteResult.data.length > 0 && str !== '' ? (
                  <BreadcrumbInfo>
                    {autoCompleteResult.data.slice(0, 4).map((item) => (
                      <AutoCompleteLine
                        active={item.value === activeAutoCompleteOption}
                        key={item.value}
                        onClick={() => {
                          const value = mergeWithString(str, item.value);
                          setStr(value);
                          tryMove(value);
                          closeUp();
                        }}
                      >
                        {takeLastSplitFromURL(item.label)}
                      </AutoCompleteLine>
                    ))}
                  </BreadcrumbInfo>
                ) : (
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
                )}
              </HeightAnimatedContainer>
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

export function notEmptyAndEqual(value: string, current: string): boolean {
  return (value || '').length > 0 && value === current;
}

//
// Take given string and try to parse valid path in our app for it.
//
export function pathFromString(str: string): string | null {
  const parts = str.split('/').filter((item) => item);
  if (parts.length === 0) {
    return getPath.home();
  } else if (parts.length === 1) {
    return getPath.home() + '?flow_id=' + parts[0];
  } else if (parts.length === 2) {
    return getPath.timeline(parts[0], parts[1]);
  } else if (parts.length === 3) {
    return getPath.step(parts[0], parts[1], parts[2]);
  } else if (parts.length === 4) {
    return getPath.task(parts[0], parts[1], parts[2], parts[3]);
  }
  return null;
}

//
// Figure out path for auto complete request pased on path.
//
function urlFromString(str: string): { url: string | null; params: Record<string, string> } {
  const parts = str.split('/');
  const lastSplit = takeLastSplitFromURL(str);

  if (parts.length < 2) {
    return { url: '/flows/autocomplete', params: { 'flow_id:co': lastSplit } };
  } else if (parts.length === 2) {
    return { url: `/flows/${parts[0]}/runs/autocomplete`, params: { 'run:co': lastSplit } };
  } else if (parts.length === 3) {
    return { url: `/flows/${parts[0]}/runs/${parts[1]}/steps/autocomplete`, params: { 'step_name:co': lastSplit } };
  }
  return { url: null, params: {} };
}

//
// Add one item to path string. So a/b/c d -> a/b/c/d
//
function mergeWithString(str: string, toAdd: string): string {
  return str
    .split('/')
    .slice(0, str.split('/').length - 1)
    .concat([toAdd])
    .join('/');
}

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

const BreadcrumbEmptyInput = styled(InputWrapper)`
  width: 35rem;
  border: 1px solid ${(p) => p.theme.color.text.blue};

  input {
    padding-left: 0;
    margin-left: -0.25rem;
    &::placeholder {
      color: #808080;
    }
  }
`;

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
  max-width: 18.75rem;
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
  height: 2.375rem;

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
    background: #fff;
    padding-left: 0;
    margin-left: -0.25rem;
  }
`;

const BreadcrumbInputWrapper = styled(InputWrapper)`
  border: 1px solid ${(p) => p.theme.color.text.blue};
`;

const GoToHolder = styled.div`
  position: relative;
  font-size: 0.875rem;
  height: 2rem;
  margin-top: -0.5625rem;
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
  width: 4.6875rem;
`;

const KeyValueListValue = styled.div`
  color: ${(p) => p.theme.color.text.dark};
`;

const KeyValueListItem = styled.div`
  display: flex;
  padding: 0.3125rem 0;
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
