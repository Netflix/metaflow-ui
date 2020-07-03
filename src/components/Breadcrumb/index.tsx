import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, matchPath, Link, match, useHistory } from 'react-router-dom';
import { PATHS, PathDefinition, getPath } from '../../utils/routing';
import Button, {
  ButtonContainer,
  ButtonContainerItem,
  ButtonContainerSeparator,
  ButtonContainerHighlightedItem,
} from '../Button';
import Icon from '../Icon';

type KnownParams = {
  flowId?: string;
  runNumber?: string;
  stepName?: string;
  taskId?: string;
};

/**
 * Find need for various buttons in breadcrumb. This is now very attached to fixed urls we have now
 * so we might need to make this more generic later.
 * @param routeMatch
 * @param location
 */
function findAdditionalButtons(routeMatch: match<KnownParams> | null, location: string) {
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
      path: getPath.task(params.taskId, params.runNumber, params.stepName, params.taskId),
    });
  }

  return buttons;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const routeMatch = matchPath<KnownParams>(
    location.pathname,
    Object.keys(PATHS).map((key) => PATHS[key as keyof PathDefinition]),
  );

  const buttonList = findAdditionalButtons(routeMatch, location.search);

  const [edit, setEdit] = useState(false);

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.charCode === 13) {
      const parts = e.currentTarget.value.split('/').filter((item) => item);

      if (parts.length === 2) {
        history.replace(getPath.timeline(parts[0], parts[1]));
      } else if (parts.length === 3) {
        history.replace(getPath.step(parts[0], parts[1], parts[2]));
      } else if (parts.length === 4) {
        history.replace(getPath.task(parts[0], parts[1], parts[2], parts[3]));
      } else {
        setEdit(false);
      }
    }
  };

  return (
    <StyledBreadcrumb>
      <Button to="/">Home</Button>

      {buttonList.length === 0 && !edit && <StyledInput onClick={() => setEdit(true)} />}

      {!edit && buttonList.length > 0 && (
        <ButtonContainer>
          {buttonList.map(({ label, path }, index) => {
            const element = <ButtonContainerItem active={index + 1 === buttonList.length}>{label}</ButtonContainerItem>;

            return (
              <>
                {index + 1 !== buttonList.length ? <Link to={path}>{element}</Link> : element}
                {index + 1 !== buttonList.length ? <ButtonContainerSeparator>|</ButtonContainerSeparator> : ''}
              </>
            );
          })}
          <ButtonContainerHighlightedItem onClick={() => setEdit(true)}>
            <Icon name="pen" size="lg" />
          </ButtonContainerHighlightedItem>
        </ButtonContainer>
      )}

      {edit && (
        <GoToHolder>
          <GoToContainer>
            <div style={{ display: 'flex' }}>
              <StyledInput
                defaultValue={buttonList.map((item) => item.label).join('/')}
                onKeyPress={onKeyPress}
                autoFocus={true}
              />
              <button onClick={() => setEdit(false)}>X</button>
            </div>
            <div>
              <div>Example:</div>
              <div>
                <div>Run</div>
                <div>MyFlow / run_id</div>
              </div>
              <div>
                <div>Step</div>
                <div>MyFlow / run_id / step_name</div>
              </div>
              <div>
                <div>Task</div>
                <div>MyFlow / run_id / step_name / task_id</div>
              </div>
            </div>
          </GoToContainer>
        </GoToHolder>
      )}
    </StyledBreadcrumb>
  );
};

const StyledBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  padding: 0 25px;
`;

const StyledInput = styled.input`
  flex: 1;
  height: 38px;
  line-height: 38px;
  border: 1px solid #d7d7d7;
  background: #f6f6f6;
  border-radius: 4px;
`;

const GoToHolder = styled.div`
  position: relative;
  height: 38px;
`;

const GoToContainer = styled.div`
  position: absolute;
  top: -10px;
  left: 0;
  width: 500px;
  background: #fff;
  border: 1px solid #d7d7d7;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 6px;
  padding: 10px;
`;

export default Breadcrumb;
