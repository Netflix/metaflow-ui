import React, { useEffect, useCallback, useReducer } from 'react';

import { Run as IRun } from '../../types';
import useResource from '../../hooks/useResource';
import { parseOrderParam, directionFromText, swapDirection } from '../../utils/url';
import HomeSidebar from './Sidebar';
import HomeContentArea from './Content';
import ErrorBoundary from '../../components/GeneralErrorBoundary';
import { useTranslation } from 'react-i18next';
import useHomeParameters, { defaultHomeParameters } from './useHomeParameters';
import HomeReducer from './Home.state';
import { isGrouping, makeActiveRequestParameters, makeWebsocketParameters, paramList } from './Home.utils';
import ScrollToTop from './ScrollToTop';

const Home: React.FC = () => {
  const { t } = useTranslation();

  //
  // State
  //

  const [
    { showLoader, isLastPage, page, rungroups, newRuns, params, placeHolderParameters, initialised, isScrolledFromTop },
    dispatch,
  ] = useReducer(HomeReducer, {
    initialised: false,
    showLoader: true,
    isLastPage: false,
    page: 1,
    rungroups: {},
    newRuns: [],
    params: defaultHomeParameters,
    placeHolderParameters: null,
    isScrolledFromTop: false,
  });

  //
  // QueryParams
  //

  const onParametersUpdate = useCallback((activeParams) => {
    dispatch({ type: 'setParams', params: activeParams });
  }, []);
  const { setQp } = useHomeParameters(onParametersUpdate);
  const defaultFiltersActive = JSON.stringify(defaultHomeParameters) === JSON.stringify(params);
  const resetAllFilters = useCallback(() => {
    // Reseting filter still keeps grouping settings as before.
    setQp({ ...defaultHomeParameters }, 'replace');
  }, [setQp]);

  //
  // Data
  //

  const requestParameters = makeActiveRequestParameters({
    ...params,
    _page: String(page),
    ...(placeHolderParameters || {}),
  });

  const { error, status } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    pause: !initialised,
    // If we are showing big loader, it means we are replacing all the data in view. In that case
    // we dont want websocket messages until we get the first response.
    subscribeToEvents: !showLoader,
    queryParams: requestParameters,
    websocketParams: makeWebsocketParameters(requestParameters, rungroups, isLastPage),
    onUpdate: (items, result) => {
      // Remove old data if we are in first page/we handle fake params
      const replaceOld = page === 1 || !!placeHolderParameters;
      // Check if we just got last page so we can disable auto loader
      const lastPage = typeof result?.pages?.next !== 'number';
      dispatch({ type: 'data', data: items, replace: replaceOld, isLastPage: lastPage });
    },
    //
    // On websocket update just add items to new groups
    //
    onWSUpdate: (item: IRun) => {
      dispatch({ type: 'realtimeData', data: [item] });
    },
    //
    // Make sure that we dont have loader anymore after request
    //
    postRequest(success) {
      if (!success && (page === 1 || placeHolderParameters)) {
        dispatch({ type: 'data', data: [], replace: true });
      }
    },
  });

  //
  // Event Handlers
  //

  const changeParameter = (key: string, value: string) => {
    setQp({ [key]: value || undefined });
  };

  // Update parameter list
  const updateListValue = (key: string, val: string) => {
    const vals = new Set(paramList(params[key]));
    const value = val === 'None' ? 'null' : val;

    if (!vals.has(value)) {
      vals.add(value);
    } else {
      vals.delete(value);
    }

    changeParameter(key, [...vals.values()].join(','));
  };

  const handleGroupTitleClick = (title: string) => {
    if (['flow_id', 'user'].indexOf(params._group) > -1) {
      dispatch({ type: 'groupReset' });

      if (params._group === 'flow_id') {
        setQp({ flow_id: title });
      } else if (params._group === 'user') {
        const param = title === 'None' ? 'null' : title;
        // Remove other user tags
        const newtags = params._tags
          ? params._tags
              .split(',')
              .filter((str) => !str.startsWith('user:'))
              .join(',')
          : '';

        setQp({ _tags: newtags, user: param });
      }
    }
  };

  const handleOrderChange = (orderProp: string) => {
    const [currentDirection, currentOrderProp] = parseOrderParam(params._order);
    const nextOrder = `${directionFromText(currentDirection)}${orderProp}`;
    changeParameter('_order', currentOrderProp === orderProp ? swapDirection(nextOrder) : nextOrder);
  };

  const handleLoadMore = () => {
    if (isLastPage || showLoader) return;
    dispatch({ type: 'setPage', page: page + 1 });
  };

  //
  // Effects
  //

  useEffect(() => {
    if (Object.keys(params).length === 0) {
      resetAllFilters();
    }
  }, [params, resetAllFilters]);

  // Jump to page 1 if we change filters
  useEffect(() => {
    if (page !== 1) {
      dispatch({ type: 'setPage', page: 1 });
    }
  }, [params.flow_id, params._tags, params.status, params._group]); // eslint-disable-line

  //
  // Scroll status
  //
  useEffect(() => {
    const listener = () => {
      if (window.scrollY > 100 && !isScrolledFromTop) {
        dispatch({ type: 'setScroll', isScrolledFromTop: true });
      } else if (window.scrollY <= 100 && isScrolledFromTop) {
        dispatch({ type: 'setScroll', isScrolledFromTop: false });
      }
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, [isScrolledFromTop]);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <ErrorBoundary message={t('error.sidebar-error')}>
        <HomeSidebar
          handleParamChange={changeParameter}
          updateListValue={updateListValue}
          params={params}
          defaultFiltersActive={defaultFiltersActive}
          resetAllFilters={resetAllFilters}
        />
      </ErrorBoundary>

      <ErrorBoundary message={t('home-error')}>
        <HomeContentArea
          error={error}
          status={status}
          showLoader={showLoader}
          params={params}
          runGroups={rungroups}
          handleOrderChange={handleOrderChange}
          handleGroupTitleClick={handleGroupTitleClick}
          updateListValue={updateListValue}
          loadMore={handleLoadMore}
          targetCount={isGrouping(params) ? parseInt(params._group_limit) : parseInt(params._limit) * page}
          grouping={isGrouping(params)}
        />
        <ScrollToTop show={isScrolledFromTop} newRunsAvailable={newRuns.length > 0} />
      </ErrorBoundary>
    </div>
  );
};

export default Home;
