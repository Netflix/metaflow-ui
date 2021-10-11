import { createRun } from '../../../utils/testhelper';
import HomeReducer, { HomeState, mergeTo, mergeWithSeparatePool } from '../Home.state';

const defaultHomeParameters = {
  _order: '-ts_epoch',
  _limit: '30',
  _group_limit: '30',
  status: 'completed,failed,running',
};

const EmptyState: HomeState = {
  initialised: false,
  showLoader: false,
  page: 1,
  isLastPage: false,
  rungroups: {},
  newRuns: [],
  params: defaultHomeParameters,
  placeHolderParameters: null,
  isScrolledFromTop: false,
};

describe('Home.state', () => {
  it('HomeReducer', () => {
    expect(HomeReducer(EmptyState, { type: 'setPage', page: 1 })).to.eql(EmptyState);
  });

  it('HomeReducer - setPage', () => {
    expect(HomeReducer(EmptyState, { type: 'setPage', page: 2 })).to.eql({ ...EmptyState, page: 2 });
    expect(HomeReducer(EmptyState, { type: 'setPage', page: 99 })).to.eql({ ...EmptyState, page: 99 });
    // Placeholder parameters should cleared
    expect(
      HomeReducer({ ...EmptyState, placeHolderParameters: { _limit: '1', _page: '1' } }, { type: 'setPage', page: 2 }),
    ).to.eql({ ...EmptyState, page: 2 });
  });

  it('HomeReducer - setLastPage', () => {
    expect(HomeReducer(EmptyState, { type: 'setLastPage', isLast: true })).to.eql({ ...EmptyState, isLastPage: true });
    expect(HomeReducer({ ...EmptyState, isLastPage: true }, { type: 'setLastPage', isLast: false })).to.eql(EmptyState);
  });

  it('HomeReducer - setLoader', () => {
    expect(HomeReducer(EmptyState, { type: 'setLoader', show: true })).to.eql({ ...EmptyState, showLoader: true });
    expect(HomeReducer({ ...EmptyState, showLoader: true }, { type: 'setLoader', show: false })).to.eql(EmptyState);
  });

  it('HomeReducer - setParams', () => {
    // Activates loader. and page should jump to 1
    expect(
      HomeReducer(
        { ...EmptyState, page: 2 },
        { type: 'setParams', params: { ...defaultHomeParameters, flow_id: 'TestFlow' }, cachedResult: false },
      ),
    ).to.eql({
      ...EmptyState,
      params: { ...EmptyState.params, flow_id: 'TestFlow' },
      placeHolderParameters: null,
      page: 1,
      showLoader: true,
      initialised: true,
    });

    // When cached result is true, we are loading more recent content using placeholder params
    expect(
      HomeReducer(
        { ...EmptyState, page: 2 },
        { type: 'setParams', params: { flow_id: 'TestFlow', _limit: '10' }, cachedResult: true },
      ),
    ).to.eql({
      ...EmptyState,
      params: { flow_id: 'TestFlow', _limit: '10' },
      placeHolderParameters: { _limit: '20', _page: '1' },
      page: 2,
      showLoader: true,
      initialised: true,
    });

    // When reordering, page keeps on current page, placeholder params will load whole batch.
    expect(
      HomeReducer(
        { ...EmptyState, page: 2, params: { _order: '+flow_id', _limit: '10' } },
        { type: 'setParams', params: { _order: '-flow_id', _limit: '10' }, cachedResult: false },
      ),
    ).to.eql({
      ...EmptyState,
      params: { _limit: '10', _order: '-flow_id' },
      placeHolderParameters: { _limit: '20', _page: '1' },
      page: 2,
      showLoader: true,
      initialised: true,
    });
  });

  it('HomeReducer - data', () => {
    // Run gets assigned to 'undefined' group when grouping is not set
    expect(HomeReducer(EmptyState, { type: 'data', data: [createRun({})], replace: false })).to.eql({
      ...EmptyState,
      rungroups: { undefined: [createRun({})] },
    });

    // Replace parameter clears old data
    expect(
      HomeReducer(
        {
          ...EmptyState,
          rungroups: { undefined: [createRun({})] },
        },
        { type: 'data', data: [createRun({ run_number: 999 })], replace: true },
      ),
    ).to.eql({
      ...EmptyState,
      rungroups: { undefined: [createRun({ run_number: 999 })] },
    });

    // Without replace add to array
    expect(
      HomeReducer(
        {
          ...EmptyState,
          rungroups: { undefined: [createRun({})] },
        },
        { type: 'data', data: [createRun({ run_number: 999 })], replace: false },
      ),
    ).to.eql({
      ...EmptyState,
      rungroups: { undefined: [createRun({}), createRun({ run_number: 999 })] },
    });

    // Clear newruns section if replacing
    expect(
      HomeReducer(
        {
          ...EmptyState,
          newRuns: [createRun({})],
        },
        { type: 'data', data: [], replace: true },
      ),
    ).to.eql({
      ...EmptyState,
      newRuns: [],
    });
  });

  it('HomeReducer - realtimeData', () => {
    // When isScrolledFromTop is false and no grouping, just add data to run groups
    expect(HomeReducer(EmptyState, { type: 'realtimeData', data: [createRun({})] })).to.eql({
      ...EmptyState,
      rungroups: {
        undefined: [createRun({})],
      },
    });
    // When scrolled from top, we dont want to cause layout shift so add data to separate pool.
    expect(
      HomeReducer(
        {
          ...EmptyState,
          isScrolledFromTop: true,
        },
        { type: 'realtimeData', data: [createRun({})] },
      ),
    ).to.eql({
      ...EmptyState,
      isScrolledFromTop: true,
      newRuns: [createRun({})],
    });
  });

  it('HomeReducer - groupReset', () => {
    expect(
      HomeReducer(
        { ...EmptyState, rungroups: { undefined: [createRun({})] }, newRuns: [createRun({})], page: 10 },
        { type: 'groupReset' },
      ),
    ).to.eql({ ...EmptyState, showLoader: true });
  });

  it('HomeReducer - setScroll', () => {
    // When there is no groups, just change isScrolledFromTopValue
    expect(HomeReducer(EmptyState, { type: 'setScroll', isScrolledFromTop: true })).to.eql({
      ...EmptyState,
      isScrolledFromTop: true,
    });

    // When scrolling from down to top, merge new runs to groups
    expect(
      HomeReducer(
        {
          ...EmptyState,
          isScrolledFromTop: true,
          newRuns: [createRun({ run_number: 123 })],
          rungroups: { undefined: [createRun({})] },
        },
        { type: 'setScroll', isScrolledFromTop: false },
      ),
    ).to.eql({
      ...EmptyState,
      rungroups: { undefined: [createRun({}), createRun({ run_number: 123 })] },
      newRuns: [],
    });
  });

  it('mergeTo', () => {
    // Health check
    expect(mergeTo([], {}, {})).to.eql({});
    // Create new run group
    expect(mergeTo([createRun({})], {}, {})).to.eql({ undefined: [createRun({})] });
    // Add to exsiting run group
    expect(
      mergeTo(
        [createRun({ run_number: 1 })],
        { undefined: [createRun({ run_number: 2 })] },
        { _order: defaultHomeParameters._order },
      ),
    ).to.eql({
      undefined: [createRun({ run_number: 2 }), createRun({ run_number: 1 })],
    });
    // Includes sorting
    expect(
      mergeTo([createRun({ run_number: 2 })], { undefined: [createRun({ run_number: 1 })] }, { _order: '-run_number' }),
    ).to.eql({
      undefined: [createRun({ run_number: 1 }), createRun({ run_number: 2 })],
    });

    // Add when grouping on
    expect(mergeTo([createRun({ flow_id: 'TestFlow' })], {}, { _group: 'flow_id' })).to.eql({
      TestFlow: [createRun({ flow_id: 'TestFlow' })],
    });

    // Merge run with same run_number and group parameter
    expect(
      mergeTo(
        [createRun({ flow_id: 'TestFlow', finished_at: 123 })],
        { TestFlow: [createRun({ flow_id: 'TestFlow', finished_at: undefined })] },
        { _group: 'flow_id', _order: defaultHomeParameters._order },
      ),
    ).to.eql({ TestFlow: [createRun({ flow_id: 'TestFlow', finished_at: 123 })] });

    // Add to existing group
    expect(
      mergeTo(
        [createRun({ flow_id: 'TestFlow', run_number: 1 })],
        { TestFlow: [createRun({ flow_id: 'TestFlow', run_number: 2 })] },
        { _group: 'flow_id', _order: defaultHomeParameters._order },
      ),
    ).to.eql({
      TestFlow: [createRun({ flow_id: 'TestFlow', run_number: 2 }), createRun({ flow_id: 'TestFlow', run_number: 1 })],
    });

    // Add to new group
    expect(
      mergeTo(
        [createRun({ flow_id: 'Test2Flow', run_number: 1 })],
        { TestFlow: [createRun({ flow_id: 'TestFlow', run_number: 2 })] },
        { _group: 'flow_id', _order: defaultHomeParameters._order },
      ),
    ).to.eql({
      TestFlow: [createRun({ flow_id: 'TestFlow', run_number: 2 })],
      Test2Flow: [createRun({ flow_id: 'Test2Flow', run_number: 1 })],
    });
  });

  it('mergeWithSeparatePool', () => {
    expect(mergeWithSeparatePool([], { rungroups: {}, newRuns: [] }, {})).to.eql({ rungroups: {}, newRuns: [] });

    expect(mergeWithSeparatePool([createRun({})], { rungroups: {}, newRuns: [] }, {})).to.eql({
      rungroups: {},
      newRuns: [createRun({})],
    });

    // Replace existing if runnumber matches
    expect(
      mergeWithSeparatePool(
        [createRun({ finished_at: 123 })],
        { rungroups: {}, newRuns: [createRun({ finished_at: undefined })] },
        {},
      ),
    ).to.eql({ rungroups: {}, newRuns: [createRun({ finished_at: 123 })] });
    // Add to new runs
    expect(
      mergeWithSeparatePool([createRun({ run_number: 2 })], { rungroups: {}, newRuns: [createRun({})] }, {}),
    ).to.eql({
      rungroups: {},
      newRuns: [createRun({}), createRun({ run_number: 2 })],
    });

    // Merge one to existing and add one to new runs
    expect(
      mergeWithSeparatePool(
        [createRun({ finished_at: 123 }), createRun({ run_number: 2 })],
        { rungroups: { undefined: [createRun({})] }, newRuns: [] },
        { _order: defaultHomeParameters._order },
      ),
    ).to.eql({
      rungroups: { undefined: [createRun({ finished_at: 123 })] },
      newRuns: [createRun({ run_number: 2 })],
    });
  });
});
