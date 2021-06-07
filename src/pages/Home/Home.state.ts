import { Run } from '../../types';
import { sortRuns } from './Home.utils';

type HomeState = {
  initialised: boolean;
  // Loader that we show when we are about to replace existing data.
  showLoader: boolean;
  // Current page number. Get overriden by placeholderParameter on reordering queries
  page: number;
  // Keep track if we are on last page.
  isLastPage: boolean;
  // Groups to render {[groupName]: data}
  rungroups: Record<string, Run[]>;
  // New runs that are not yet added to list
  // TODO: Explain better here why this is
  newRuns: Run[];
  // Active parameters
  params: Record<string, string>;
  // WARNING: These placeHolderParameters are workaround for one special case. Generally when we are changing filters, we want to
  // reset page to start (page = 1). BUT when ordering stuff again, we want to keep same amount items as before. We don't
  // want to interfere pagination overall, but we need to fetch all new stuff in one request, so we store these placeHolderParameters here
  // for one request.
  //
  // For example if we are in page 5 with limit 15, when we reorder fakeparams would be set to page=1&limit=75. However url params are kept
  // in page=5&limit15 so that when user scrolls down, we can fetch sixth page easily.
  placeHolderParameters: { _limit: string; _page: string } | null;
  // Track if we are scrolled from top. This will cause new runs to go "newData" pool instead of straight to view
  isScrolledFromTop: boolean;
};

type HomeAction =
  | { type: 'setLoader'; show: boolean }
  | { type: 'setPage'; page: number }
  | { type: 'setLastPage'; isLast: boolean }
  | { type: 'data'; data: Run[]; replace: boolean; isLastPage?: boolean }
  | { type: 'realtimeData'; data: Run[] }
  | { type: 'setParams'; params: Record<string, string>; cachedResult: boolean }
  | { type: 'groupReset' }
  | { type: 'setScroll'; isScrolledFromTop: boolean };

const HomeReducer = (state: HomeState, action: HomeAction): HomeState => {
  switch (action.type) {
    case 'setPage':
      return { ...state, page: action.page, placeHolderParameters: null };
    case 'setLastPage':
      return { ...state, isLastPage: action.isLast };
    case 'setLoader':
      return { ...state, showLoader: action.show };
    case 'setParams': {
      const shouldGoToPageOne =
        state.params.flow_id !== action.params.flow_id ||
        state.params._tags !== action.params._tags ||
        state.params.status !== action.params.status ||
        state.params._group !== action.params._group;
      const reordering = state.params._order !== action.params._order && state.page > 1;

      return {
        ...state,
        params: action.params,
        placeHolderParameters:
          reordering || action.cachedResult
            ? { _limit: String(parseInt(action.params._limit) * state.page), _page: '1' }
            : null,
        page: action.cachedResult ? state.page : shouldGoToPageOne ? 1 : reordering ? state.page : 1,
        showLoader: true,
        initialised: true,
      };
    }
    case 'data':
      return {
        ...state,
        isLastPage: typeof action.isLastPage === 'boolean' ? action.isLastPage : state.isLastPage,
        // Add / merge incoming stuff to existing, if replace parameter is given, clear old stuff
        rungroups: mergeTo(action.data, action.replace ? {} : state.rungroups, state.params),
        // If we have replace parameters, it means that old websocket updates are not relevant anymore so
        // we can clear new runs here.
        newRuns: action.replace ? [] : state.newRuns,
        showLoader: false,
      };

    case 'realtimeData': {
      if (state.isScrolledFromTop && !state.params._group) {
        return {
          ...state,
          ...mergeWithSeparatePool(action.data, { rungroups: state.rungroups, newRuns: state.newRuns }, state.params),
        };
      }
      return {
        ...state,
        rungroups: mergeTo(action.data, state.rungroups, state.params),
      };
    }

    case 'groupReset':
      return { ...state, rungroups: {}, newRuns: [], showLoader: true, page: 1 };

    case 'setScroll': {
      if (!action.isScrolledFromTop && state.isScrolledFromTop && Object.keys(state.rungroups).length > 0) {
        return {
          ...state,
          isScrolledFromTop: action.isScrolledFromTop,
          rungroups: mergeTo(state.newRuns, state.rungroups, state.params),
          newRuns: [],
        };
      }
      return { ...state, isScrolledFromTop: action.isScrolledFromTop };
    }
  }
};

/**
 * Add or merge incoming runs to existing run groups
 * @param runs Incoming runs
 * @param initialData Existing run groups
 * @param params
 */
function mergeTo(
  runs: Run[],
  initialData: Record<string, Run[]>,
  params: Record<string, string>,
): Record<string, Run[]> {
  return runs.reduce((data, item) => {
    const groupKey = item[params._group as keyof Run] || 'undefined';
    if (typeof groupKey === 'string') {
      if (data[groupKey]) {
        const index = data[groupKey].findIndex((r) => r.run_number === item.run_number);
        return {
          ...data,
          [groupKey]:
            index > -1
              ? sortRuns(
                  data[groupKey].map((r) => (r.run_number === item.run_number ? item : r)),
                  params._order,
                )
              : sortRuns([...data[groupKey], item], params._order),
        };
      } else {
        return {
          ...data,
          [groupKey]: [item],
        };
      }
    }
    return data;
  }, initialData);
}

type DataAndNew = {
  rungroups: Record<string, Run[]>;
  newRuns: Run[];
};

/**
 * Adds new runs to existing run groups OR in some cases add them to separate pool to be added to run groups later.
 * If we are not grouping and user has scrolled the view, we don't want to add new runs to the list since it would cause
 * layout shifts. We only add new runs to view when we scroll up. BUT if incoming run already exists in view, we will update it.
 * @param runs Incoming runs
 * @param initialData Existing runs that are visible in UI and runs that are not visible, but are queued to be shown
 * @param params
 */
function mergeWithSeparatePool(runs: Run[], initialData: DataAndNew, params: Record<string, string>): DataAndNew {
  return runs.reduce((data, item): DataAndNew => {
    const groupKey = item[params._group as keyof Run] || 'undefined';
    if (typeof groupKey === 'string') {
      // If we already have same group, we need to check if we can add current item there
      if (data.rungroups[groupKey]) {
        const index = data.rungroups[groupKey].findIndex((r) => r.run_number === item.run_number);
        // If we already have this run, we can update it....
        if (index > -1) {
          return {
            rungroups: {
              ...data.rungroups,
              [groupKey]: sortRuns(
                data.rungroups[groupKey].map((r) => (r.run_number === item.run_number ? item : r)),
                params._order,
              ),
            },
            newRuns: data.newRuns,
          };
        }
      }
      //...else we need to merge or add it to newData
      const indexInNewData = data.newRuns.findIndex((r) => r.run_number === item.run_number);

      return {
        rungroups: data.rungroups,
        newRuns:
          indexInNewData > -1
            ? data.newRuns.map((r) => (r.run_number === item.run_number ? item : r))
            : [...data.newRuns, item],
      };
    }
    return data;
  }, initialData);
}

export default HomeReducer;
