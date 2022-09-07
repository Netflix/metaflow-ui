import React, { useEffect, useCallback, useReducer, useContext, useRef } from 'react';

import { Run as IRun } from '../../types';
import useResource, { DataModel } from '../../hooks/useResource';
import { parseOrderParam, directionFromText, swapDirection } from '../../utils/url';
import { getTimeFromPastByDays } from '../../utils/date';
import HomeSidebar from './Sidebar';
import HomeContentArea from './Content';
import ErrorBoundary from '../../components/GeneralErrorBoundary';
import { useTranslation } from 'react-i18next';
import useHomeParameters, { defaultHomeParameters } from './useHomeParameters';
import HomeReducer from './Home.state';
import {
  isGrouping,
  makeActiveRequestParameters,
  makeWebsocketParameters,
  paramList,
  isDefaultParams,
} from './Home.utils';
import ScrollToTop from './ScrollToTop';
import { useHistory } from 'react-router';
import { TimezoneContext } from '../../components/TimezoneProvider';
import { DEFAULT_TIME_FILTER_DAYS } from '../../constants';

type HomeCache = {
  active: boolean;
  data: Record<string, IRun[]>;
  scroll: number;
  page: number;
};

const HomeStateCache: HomeCache = {
  active: false,
  data: {},
  scroll: 0,
  page: 1,
};

const emptyArray: IRun[] = [];

const Home: React.FC = () => {
  const { t } = useTranslation();

  const { action: historyAction } = useHistory();
  const { timezone } = useContext(TimezoneContext);

  const { setQp, params: rawParams } = useHomeParameters();

  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;

      HomeStateCache.active = false;
      // Try to use same params as last time when on frontpage. But only try this if
      // user is coming to default frontpage. We don't want to interrupt direct links from working
      const fromLS = localStorage.getItem('home-params');
      const lastUsedParams = fromLS ? JSON.parse(fromLS) : false;
      if (lastUsedParams && isDefaultParams(rawParams, false)) {
        setQp(lastUsedParams);
      }
    }
  }, [rawParams, setQp]);

  //
  // QueryParams
  //

  const resetAllFilters = useCallback(() => {
    // Reseting filter still keeps grouping settings as before.
    setQp(
      {
        ...defaultHomeParameters,
        timerange_start: getTimeFromPastByDays(DEFAULT_TIME_FILTER_DAYS, timezone).toString(),
      },
      'replace',
    );
  }, [setQp, timezone]);

  useEffect(() => {
    dispatch({
      type: 'setParams',
      params: rawParams,
      cachedResult: shouldUseCachedResult(historyAction),
    });
    localStorage.setItem('home-params', JSON.stringify(rawParams));
  }, [historyAction, rawParams]);

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
    page: historyAction === 'POP' ? HomeStateCache.page : 1,
    rungroups: historyAction === 'POP' ? HomeStateCache.data : {},
    newRuns: [],
    params: rawParams || defaultHomeParameters,
    placeHolderParameters: null,
    isScrolledFromTop: historyAction === 'POP' && HomeStateCache.scroll > 100,
  });

  const onUpdate = useCallback(
    (items: IRun[], result: DataModel<IRun[]> | undefined) => {
      // Remove old data if we are in first page/we handle fake params
      const replaceOld = page === 1 || !!placeHolderParameters;
      // Check if we just got last page so we can disable auto loader
      const lastPage = typeof result?.pages?.next !== 'number';
      dispatch({ type: 'data', data: items, replace: replaceOld, isLastPage: lastPage });
    },
    [page, placeHolderParameters],
  );

  const postRequest = useCallback(
    (success: boolean) => {
      if (!success && (page === 1 || placeHolderParameters)) {
        dispatch({ type: 'data', data: [], replace: true });
      }
    },
    [page, placeHolderParameters],
  );

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
    initialData: emptyArray,
    pause: !initialised,
    // If we are showing big loader, it means we are replacing all the data in view. In that case
    // we dont want websocket messages until we get the first response.
    subscribeToEvents: !showLoader,
    queryParams: requestParameters,
    websocketParams: makeWebsocketParameters(requestParameters, rungroups, isLastPage),
    onUpdate,
    //
    // On websocket update just add items to new groups
    //
    onWSUpdate: (item: IRun) => {
      dispatch({ type: 'realtimeData', data: [item] });
    },
    //
    // Make sure that we dont have loader anymore after request
    //
    postRequest,
  });

  //
  // Cache
  //

  useEffect(() => {
    const scrollValue = HomeStateCache.scroll;
    if (historyAction === 'POP' && scrollValue > 0 && initialised) {
      HomeStateCache.active = true;
    } else if (historyAction !== 'POP' || scrollValue === 0) {
      HomeStateCache.active = true;
    }

    if (historyAction !== 'POP' && initialised) {
      if (isDefaultParams(rawParams, false, timezone)) {
        // We want to add timerange filter if we are rolling with default params
        // but not in back event. In back event we should keep state we had
        setQp({ timerange_start: getTimeFromPastByDays(DEFAULT_TIME_FILTER_DAYS, timezone).toString() });
      }
    }
  }, [historyAction, initialised, rawParams, setQp, timezone]);

  // Update cache page on page change
  useEffect(() => {
    HomeStateCache.page = page;
  }, [page]);

  // Update cache data on data changes
  useEffect(() => {
    HomeStateCache.data = rungroups;
  }, [rungroups]);

  //
  // Event Handlers
  //

  const changeParameter = useCallback(
    (key: string, value: string) => {
      setQp({ [key]: value || undefined });
    },
    [setQp],
  );

  // Update parameter list
  const updateListValue = useCallback(
    (key: string, val: string) => {
      const vals = new Set(paramList(params[key]));
      const value = val === 'None' ? 'null' : val;

      if (!vals.has(value)) {
        vals.add(value);
      } else {
        vals.delete(value);
      }

      changeParameter(key, [...vals.values()].join(','));
    },
    [changeParameter, params],
  );

  const handleGroupTitleClick = useCallback(
    (title: string) => {
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
    },
    [params._group, params._tags, setQp],
  );

  const handleOrderChange = useCallback(
    (orderProp: string) => {
      const [currentDirection, currentOrderProp] = parseOrderParam(params._order);
      const nextOrder = `${directionFromText(currentDirection)}${orderProp}`;
      changeParameter('_order', currentOrderProp === orderProp ? swapDirection(nextOrder) : nextOrder);
    },
    [changeParameter, params._order],
  );

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
      if (HomeStateCache.active) {
        HomeStateCache.scroll = window.scrollY;
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

function shouldUseCachedResult(historyAction: string) {
  // We should use cached result on init if route action was POP (back), we haven't yet used cache and cache scroll is
  // creater than 0. If scroll state of cache is 0, we might as well load new results.
  return historyAction === 'POP' && !HomeStateCache.active && HomeStateCache.scroll > 0;
}

export default Home;
