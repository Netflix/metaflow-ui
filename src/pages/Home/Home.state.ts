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
  data: Record<string, Run[]>;
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
};

type HomeAction =
  | { type: 'setLoader'; show: boolean }
  | { type: 'setPage'; page: number }
  | { type: 'setLastPage'; isLast: boolean }
  | { type: 'data'; data: Run[]; replace: boolean; isLastPage?: boolean }
  | { type: 'setParams'; params: Record<string, string> }
  | { type: 'postRequest' }
  | { type: 'groupReset' };

const HomeReducer = (state: HomeState, action: HomeAction): HomeState => {
  console.log(action);
  switch (action.type) {
    case 'setPage':
      return { ...state, page: action.page, placeHolderParameters: null };
    case 'setLastPage':
      return { ...state, isLastPage: action.isLast };
    case 'setLoader':
      return { ...state, showLoader: action.show };
    case 'setParams': {
      const reordering = state.params._order !== action.params._order && state.page > 1;
      return {
        ...state,
        params: action.params,
        placeHolderParameters: reordering
          ? { _limit: String(parseInt(action.params._limit) * state.page), _page: '1' }
          : null,
        page: reordering ? state.page : 1,
        showLoader: true,
        initialised: true,
      };
    }
    case 'data':
      return {
        ...state,
        isLastPage: typeof action.isLastPage === 'boolean' ? action.isLastPage : state.isLastPage,
        data: action.data.reduce(
          (data, item) => {
            const groupKey = item[state.params._group] || 'undefined';
            if (typeof groupKey === 'string') {
              if (data[groupKey]) {
                const index = data[groupKey].findIndex((r) => r.run_number === item.run_number);
                return {
                  ...data,
                  [groupKey]:
                    index > -1
                      ? sortRuns(
                          data[groupKey].map((r) => (r.run_number === item.run_number ? item : r)),
                          state.params._order,
                        )
                      : sortRuns([...data[groupKey], item], state.params._order),
                };
              } else {
                return {
                  ...data,
                  [groupKey]: [item],
                };
              }
            }
            return data;
          },
          action.replace ? {} : state.data,
        ),
      };

    case 'postRequest':
      return { ...state, showLoader: false };

    case 'groupReset':
      return { ...state, data: {}, showLoader: true, page: 1 };
  }
};
export default HomeReducer;
