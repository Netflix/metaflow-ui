import { mount } from '@cypress/react';
import React, { useState } from 'react';
import useLogData, { LogDataSettings } from '..';
import { createDataModel } from '@utils/testhelper';
import { gid } from '@utils/testing';

const TestComponent: React.FC<Partial<LogDataSettings>> = (props) => {
  const [paused, setPaused] = useState(typeof props.paused === 'boolean' ? props.paused : true);
  const logdata = useLogData({ url: '/log-test', paused, preload: false, ...props });

  return (
    <div>
      <div data-testid="status">{logdata.status}</div>
      <div data-testid="preloadStatus">{logdata.preloadStatus}</div>
      <div data-testid="logs">{JSON.stringify(logdata.logs)}</div>
      <div data-testid="error">{JSON.stringify(logdata.error)}</div>
      <button data-testid="set-paused" onClick={() => setPaused(false)}>
        set pause false
      </button>
      <button data-testid="load-page-five" onClick={() => logdata.loadMore(4)}>
        Load page 5
      </button>
      <button data-testid="load-page-one" onClick={() => logdata.loadMore(1)}>
        Load page 2
      </button>
      <button data-testid="load-page-zero" onClick={() => logdata.loadMore(0)}>
        Load page 1
      </button>
    </div>
  );
};

describe('useLogData', () => {
  beforeEach(() => {
    cy.intercept('**/api/log-test*', (req) => {
      // Hard code all situations needed in tests.
      if (req.query._order === '-row') {
        req.reply(createDataModel([{ row: 2, line: 'hello' }], {}));
      } else {
        if (req.query._page === '5') {
          req.reply(createDataModel([{ row: 4, line: 'hello' }], {}));
        } else if (req.query._page === '2') {
          req.reply(createDataModel([{ row: 1, line: 'hello' }], {}));
        } else {
          req.reply(createDataModel([{ row: 0, line: 'hello' }], {}));
        }
      }
    });
  });

  it('Should have default state', () => {
    mount(<TestComponent />);

    gid('status').contains('NotAsked');
    gid('preloadStatus').contains('NotAsked');
    gid('logs').contains('[]');
  });

  it('Should only preload', () => {
    mount(<TestComponent preload />);

    gid('status').contains('NotAsked');
    gid('preloadStatus').contains('Ok');
    gid('logs').contains('[null,null,{"row":2,"line":"hello"}]');
  });

  it('Should load, without preload', () => {
    mount(<TestComponent preload={false} paused={false} />);

    gid('status').contains('Ok');
    gid('preloadStatus').contains('NotAsked');
    gid('logs').contains('[null,null,{"row":2,"line":"hello"}]');
  });

  it('Should return error on wrong url', () => {
    mount(<TestComponent url="/this-is-totally-wrong" preload={false} paused={false} />);

    gid('status').contains('Loading');
    gid('preloadStatus').contains('NotAsked');
    gid('status').contains('Error');
    gid('error').contains('generic-error');
  });

  it('Should load after paused prop changes', () => {
    mount(<TestComponent />);

    gid('status').contains('NotAsked');
    gid('set-paused').click();
    gid('status').contains('Ok');
    gid('preloadStatus').contains('NotAsked');
    gid('logs').contains('[null,null,{"row":2,"line":"hello"}]');
  });

  it('Should load more correctly', () => {
    mount(<TestComponent paused={false} pagesize={1} />);

    gid('status').contains('Ok');
    gid('logs').contains('[null,null,{"row":2,"line":"hello"}]');

    gid('load-page-one').click();
    gid('logs').contains('[null,{"row":1,"line":"hello"},{"row":2,"line":"hello"}]');

    gid('load-page-zero').click();
    gid('logs').contains('[{"row":0,"line":"hello"},{"row":1,"line":"hello"},{"row":2,"line":"hello"}]');

    gid('load-page-five').click();
    gid('logs').contains(
      '[{"row":0,"line":"hello"},{"row":1,"line":"hello"},{"row":2,"line":"hello"},null,{"row":4,"line":"hello"}]',
    );
  });
});
