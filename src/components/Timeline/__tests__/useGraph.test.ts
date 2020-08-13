import {
  getZoomAmount,
  GraphState,
  zoomOverTotalLength,
  startOutOfBounds,
  endOutOfBounds,
  startOrEndOutOfBounds,
  resetTimeline,
  validatedParameter,
  graphReducer,
} from '../useGraph';

const DEFAULT_GRAPH: GraphState = {
  alignment: 'fromStartTime',
  groupBy: 'step',
  sortBy: 'startTime',
  sortDir: 'asc',
  min: 1000,
  max: 3000,
  timelineStart: 1000,
  timelineEnd: 3000,
  controlled: false,
};

describe('useGraph hook - reducer', () => {
  it('init', () => {
    const newState = graphReducer(DEFAULT_GRAPH, { type: 'init', start: 0, end: 100 });
    expect(newState.max).toBe(100);
    expect(newState.timelineEnd).toBe(100);
    expect(newState.min).toBe(0);
    expect(newState.timelineStart).toBe(0);
  });

  it('move - basic', () => {
    // Movement does nothing because graph is all zoomed out
    const newState = graphReducer(DEFAULT_GRAPH, { type: 'move', value: 100 });
    expect(newState.timelineStart).toBe(1000);
    expect(newState.timelineEnd).toBe(3000);
  });

  it('move - move to right', () => {
    const newState = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 1600 },
      { type: 'move', value: 100 },
    );
    expect(newState.timelineStart).toBe(1600);
    expect(newState.timelineEnd).toBe(1700);
  });

  it('move - move to left', () => {
    const newState = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 1600 },
      { type: 'move', value: -100 },
    );
    expect(newState.timelineStart).toBe(1400);
    expect(newState.timelineEnd).toBe(1500);
  });

  it('move - move to far right', () => {
    // Move bar too much to the right -> Stops and state.max
    const newState = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 1600 },
      { type: 'move', value: 10000 },
    );
    expect(newState.timelineStart).toBe(2900);
    expect(newState.timelineEnd).toBe(3000);
  });

  it('move - move to far left', () => {
    // Move bar too much to the left -> Stops and state.min
    const newState = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 1600 },
      { type: 'move', value: -10000 },
    );
    expect(newState.timelineStart).toBe(1000);
    expect(newState.timelineEnd).toBe(1100);
  });

  it('updateMax - not user controller', () => {
    const newState = graphReducer(DEFAULT_GRAPH, { type: 'updateMax', end: 4000 });
    expect(newState.max).toBe(4000);
    expect(newState.timelineEnd).toBe(4000);

    const newState2 = graphReducer(DEFAULT_GRAPH, { type: 'updateMax', end: 2000 });
    expect(newState2.max).toBe(2000);
    expect(newState2.timelineEnd).toBe(2000);
  });

  it('updateMax - user controller', () => {
    const newState = graphReducer({ ...DEFAULT_GRAPH, controlled: true }, { type: 'updateMax', end: 4000 });
    expect(newState.max).toBe(4000);
    expect(newState.timelineEnd).toBe(3000);

    const newState2 = graphReducer({ ...DEFAULT_GRAPH, controlled: true }, { type: 'updateMax', end: 2000 });
    expect(newState2.max).toBe(2000);
    expect(newState2.timelineEnd).toBe(2000);
  });

  it('alignment', () => {
    expect(graphReducer(DEFAULT_GRAPH, { type: 'alignment', alignment: 'fromLeft' }).alignment).toBe('fromLeft');
    expect(graphReducer(DEFAULT_GRAPH, { type: 'alignment', alignment: 'fromStartTime' }).alignment).toBe(
      'fromStartTime',
    );
  });

  it('groupBy', () => {
    expect(graphReducer(DEFAULT_GRAPH, { type: 'groupBy', by: 'step' }).groupBy).toBe('step');
    expect(graphReducer(DEFAULT_GRAPH, { type: 'groupBy', by: 'none' }).groupBy).toBe('none');
  });

  it('sortBy', () => {
    expect(graphReducer(DEFAULT_GRAPH, { type: 'sortBy', by: 'startTime' }).sortBy).toBe('startTime');

    expect(graphReducer(DEFAULT_GRAPH, { type: 'sortBy', by: 'duration' }).sortBy).toBe('duration');
    expect(graphReducer(DEFAULT_GRAPH, { type: 'sortBy', by: 'duration' }).alignment).toBe('fromLeft');
  });

  it('sortDir', () => {
    expect(graphReducer(DEFAULT_GRAPH, { type: 'sortDir', dir: 'asc' }).sortDir).toBe('asc');
    expect(graphReducer(DEFAULT_GRAPH, { type: 'sortDir', dir: 'desc' }).sortDir).toBe('desc');
  });

  it('zoomIn - success', () => {
    const zoomedInState = graphReducer(DEFAULT_GRAPH, { type: 'zoomIn' });
    expect(zoomedInState.timelineStart).toBe(1200);
    expect(zoomedInState.timelineEnd).toBe(2800);
    expect(zoomedInState.controlled).toBe(true);
    const zoomedInState2 = graphReducer(zoomedInState, { type: 'zoomIn' });
    expect(zoomedInState2.timelineStart).toBe(1400);
    expect(zoomedInState2.timelineEnd).toBe(2600);
  });

  it('zoomIn - too deep', () => {
    const zoomedInState = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 1000, timelineEnd: 1001 },
      { type: 'zoomIn' },
    );
    // State stays same because we are trying to zoom too deep
    expect(zoomedInState.timelineStart).toBe(1000);
    expect(zoomedInState.timelineEnd).toBe(1001);
  });

  it('zoomOut - None', () => {
    const zoomedOutState = graphReducer(DEFAULT_GRAPH, { type: 'zoomOut' });
    expect(zoomedOutState.timelineStart).toBe(1000);
    expect(zoomedOutState.timelineEnd).toBe(3000);
  });

  it('zoomOut - Normal', () => {
    const zoomedOutState = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 2000 },
      { type: 'zoomOut' },
    );
    expect(zoomedOutState.timelineStart).toBe(1300);
    expect(zoomedOutState.timelineEnd).toBe(2200);
  });

  it('zoomOut - Start hits min', () => {
    const zoomedOutState1 = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 1050, timelineEnd: 1500 },
      { type: 'zoomOut' },
    );
    expect(zoomedOutState1.timelineStart).toBe(1000);
    expect(zoomedOutState1.timelineEnd).toBe(1650);

    const zoomedOutState2 = graphReducer(zoomedOutState1, { type: 'zoomOut' });
    expect(zoomedOutState2.timelineStart).toBe(1000);
    expect(zoomedOutState2.timelineEnd).toBe(1850);
  });

  it('zoomOut - end hits max', () => {
    const zoomedOutState1 = graphReducer(
      { ...DEFAULT_GRAPH, timelineStart: 2500, timelineEnd: 2950 },
      { type: 'zoomOut' },
    );
    expect(zoomedOutState1.timelineStart).toBe(2350);
    expect(zoomedOutState1.timelineEnd).toBe(3000);

    const zoomedOutState2 = graphReducer(zoomedOutState1, { type: 'zoomOut' });
    expect(zoomedOutState2.timelineStart).toBe(2150);
    expect(zoomedOutState2.timelineEnd).toBe(3000);
  });
});

describe('useGraph hook - supporting functions', () => {
  it('getZoomAmount', () => {
    // Return 10% of `max - min` when `end - start` is more than 20% of `max - min`
    // So (3000 - 1000) * 0.1 = 200
    expect(getZoomAmount(DEFAULT_GRAPH)).toBe(200);
    // Else return 2%
    expect(getZoomAmount({ ...DEFAULT_GRAPH, timelineStart: 2800 })).toBe(40);
  });

  it('zoomOverTotalLength', () => {
    // Extend timelineStart and timelienEnd by 10 to each side, This will be over total length since
    // start and end was already same size as maximum size
    expect(zoomOverTotalLength(DEFAULT_GRAPH, 10)).toBe(true);

    expect(zoomOverTotalLength({ ...DEFAULT_GRAPH, timelineStart: 1500 }, 10)).toBe(false);
    expect(zoomOverTotalLength({ ...DEFAULT_GRAPH, timelineStart: 1011, timelineEnd: 2990 }, 10)).toBe(false);
  });

  it('startOutOfBounds', () => {
    expect(startOutOfBounds(DEFAULT_GRAPH, 10)).toBe(false);
    expect(startOutOfBounds(DEFAULT_GRAPH, 1000)).toBe(false);
    expect(startOutOfBounds(DEFAULT_GRAPH, 3000)).toBe(false);
    expect(startOutOfBounds(DEFAULT_GRAPH, -1)).toBe(true);
  });

  it('endOutOfBounds', () => {
    expect(endOutOfBounds(DEFAULT_GRAPH, 10)).toBe(true);
    expect(endOutOfBounds(DEFAULT_GRAPH, -10)).toBe(false);
    expect(endOutOfBounds(DEFAULT_GRAPH, -3000)).toBe(false);
  });

  it('startOrEndOutOfBounds', () => {
    expect(startOrEndOutOfBounds(DEFAULT_GRAPH, 10)).toBe(true);
    expect(startOrEndOutOfBounds(DEFAULT_GRAPH, -10)).toBe(true);

    expect(startOrEndOutOfBounds({ ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 2000 }, 10)).toBe(false);
    expect(startOrEndOutOfBounds({ ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 2000 }, -500)).toBe(false);

    expect(startOrEndOutOfBounds({ ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 2000 }, -1000)).toBe(true);
    expect(startOrEndOutOfBounds({ ...DEFAULT_GRAPH, timelineStart: 1500, timelineEnd: 2000 }, 1500)).toBe(true);
  });

  it('resetTimeline', () => {
    expect(resetTimeline(DEFAULT_GRAPH).timelineStart).toBe(DEFAULT_GRAPH.min);
    expect(resetTimeline(DEFAULT_GRAPH).timelineEnd).toBe(DEFAULT_GRAPH.max);

    expect(resetTimeline({ ...DEFAULT_GRAPH, timelineStart: 1500 }).timelineStart).toBe(DEFAULT_GRAPH.min);
    expect(resetTimeline({ ...DEFAULT_GRAPH, timelineEnd: 1500 }).timelineEnd).toBe(DEFAULT_GRAPH.max);
  });

  it('validatedParameter', () => {
    // On non value, default to default value
    expect(validatedParameter(undefined, 2, [2, 3, 4], 3)).toBe(3);
    expect(validatedParameter(null, 2, [2, 3, 4], 3)).toBe(3);

    // If value is not allowed, give null
    expect(validatedParameter(1, 2, [2, 3, 4], 3)).toBe(null);
    expect(validatedParameter(5, 2, [2, 3, 4], 3)).toBe(null);
    expect(validatedParameter('asd', 2, [2, 3, 4], 3)).toBe(null);

    // If value is allowed, return it...
    expect(validatedParameter(3, 2, [2, 3, 4], 3)).toBe(3);
    expect(validatedParameter(4, 2, [2, 3, 4], 3)).toBe(4);
    // ...except if it's same as current value. We return null because we dont want to trigger
    // Some functionality if value hasn't changed
    expect(validatedParameter(2, 2, [2, 3, 4], 3)).toBe(null);
  });
});
