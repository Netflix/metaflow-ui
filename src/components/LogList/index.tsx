import React, { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { LogData, SearchState } from '../../hooks/useLogData';
import { useDebounce } from 'use-debounce/lib';
import { AsyncStatus, Log } from '../../types';
import { lighten } from 'polished';
import LogActionBar from './LogActionBar';

//
// Typedef
//

type LogProps = {
  logdata: LogData;
  onScroll?: (startIndex: number) => void;
  fixedHeight?: number;
  downloadUrl: string;
  setFullscreen?: () => void;
};

//
// List large amount of logs in virtualised list.
//

const LIST_MAX_HEIGHT = 400;

const LogList: React.FC<LogProps> = ({ logdata, fixedHeight, onScroll, downloadUrl, setFullscreen }) => {
  const { t } = useTranslation();
  const rows = logdata.logs;
  const [stickBottom, setStickBottom] = useState(true);
  const [cache] = useState(
    new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 25,
    }),
  );
  const _list = useRef<List>(null);
  const search = logdata.localSearch;
  const count = rows.length;

  const okCount = rows.reduce((okAmount, item) => {
    return typeof item === 'object' ? okAmount + 1 : okAmount;
  }, 0);

  const totalHeight = rows.reduce((val, _item, index) => {
    return val + (cache.getHeight(index, 0) || 0);
  }, 0);

  // Clear cached row heights on window resize events
  useEffect(() => {
    const listener = () => {
      cache.clearAll();
    };
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, []); // eslint-disable-line

  // Force row height calculations after fetch ok

  useEffect(() => {
    if (_list?.current) {
      cache.clearAll();
      _list.current.recomputeRowHeights();
    }
  }, [okCount]); // eslint-disable-line

  useEffect(() => {
    if (stickBottom && _list) {
      _list.current?.scrollToRow(count);
    }
  }, [count, okCount, stickBottom]);

  //
  // Index tracking
  //

  const [scrollIndex, setIndex] = useState(0);
  const [debouncedIndex] = useDebounce(scrollIndex, 300);
  useEffect(() => {
    if (onScroll && !stickBottom) {
      onScroll(debouncedIndex);
    }
  }, [debouncedIndex, onScroll]); // eslint-disable-line

  //
  // Search features
  //

  const searchActive = search.result.active;
  const searchCurrent = search.result.current;
  const searchQuery = search.result.query;

  useEffect(() => {
    if (searchActive && search.result.result[searchCurrent]) {
      _list.current?.scrollToRow(search.result.result[searchCurrent].line);
    }
  }, [searchActive, searchCurrent, searchQuery]);

  return (
    <div style={{ flex: '1 1 0' }} data-testid="loglist-wrapper">
      <LogActionBar
        data={logdata.logs}
        downloadlink={downloadUrl}
        setFullscreen={setFullscreen}
        search={logdata.localSearch}
      />

      {rows.length === 0 && ['Ok', 'Error'].includes(logdata.preloadStatus) && logdata.status === 'NotAsked' && (
        <div data-testid="loglist-preload-empty">{t('task.no-preload-logs')}</div>
      )}

      {rows.length === 0 && logdata.status === 'Ok' && <div data-testid="loglist-empty">{t('task.no-logs')}</div>}

      {rows.length > 0 && (
        <LogListContainer data-testid="loglist-container">
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                ref={_list}
                overscanRowCount={5}
                rowCount={rows.length}
                rowHeight={cache.rowHeight}
                onRowsRendered={(data) => {
                  if (onScroll) {
                    setIndex(data.overscanStartIndex);
                  }
                }}
                deferredMeasurementCache={cache}
                onScroll={(args: { scrollTop: number; clientHeight: number; scrollHeight: number }) => {
                  if (args.scrollTop + args.clientHeight >= args.scrollHeight) {
                    setStickBottom(true);
                  } else if (stickBottom) {
                    setStickBottom(false);
                  }
                }}
                rowRenderer={({ index, style, key, parent }) => (
                  <CellMeasurer cache={cache} columnIndex={0} key={key} rowIndex={index} parent={parent}>
                    {() => {
                      const item = rows[index];

                      return (
                        <LogLine style={style} data-testid="log-line">
                          <LogLineNumber className="logline-number">{index}</LogLineNumber>
                          <LogLineText>
                            {typeof item === 'object' ? getLineText(item as Log, search.result) : 'Loading...'}
                          </LogLineText>
                        </LogLine>
                      );
                    }}
                  </CellMeasurer>
                )}
                height={fixedHeight ? fixedHeight - 16 : totalHeight < LIST_MAX_HEIGHT ? totalHeight : LIST_MAX_HEIGHT}
                width={width}
              />
            )}
          </AutoSizer>

          {!stickBottom && (
            <ScrollToBottomButton onClick={() => setStickBottom(true)} data-testid="loglist-stick-bottom">
              {t('run.scroll-to-bottom')}
            </ScrollToBottomButton>
          )}

          <PollLoader status={logdata.status} preloadStatus={logdata.preloadStatus} />
        </LogListContainer>
      )}
    </div>
  );
};

const MatchHighlight = styled.span<{ active: boolean }>`
  background: ${(p) => (p.active ? lighten(0.2, p.theme.color.bg.yellow) : p.theme.color.bg.yellow)};
`;

function getLineText(item: Log, searchResult: SearchState) {
  if (!searchResult.active) {
    return item.line;
  }

  const match = searchResult.result.find((res) => res.line === item.row);

  if (match) {
    const isCurrent = searchResult.result[searchResult.current]?.line === match?.line;
    return (
      <>
        {item.line.substr(0, match.char[0])}
        <MatchHighlight active={isCurrent}>
          {item.line.substr(match.char[0], match.char[1] - match.char[0])}
        </MatchHighlight>
        {item.line.substr(match.char[1])}
      </>
    );
  }

  return item.line;
}

//
// Poller indicator
//

type PollLoaderProps = { status: AsyncStatus; preloadStatus: AsyncStatus };

const pollAnimate = keyframes`
0% { stroke-dashoffset: 0; }
100% { stroke-dashoffset: -125; }
`;

const loadAnimate = keyframes`
0% { transform: rotateZ(-90deg); }
100% { transform: rotateZ(270deg); }
`;

const PollLoaderContainer = styled.div<{ show: boolean; preloadStatus: AsyncStatus }>`
  position: absolute;
  top: 0.5rem;
  right: 1rem;

  opacity: ${(p) => (p.show ? '1' : '0')};
  transition: 0.25s opacity;
`;

const PollWaitingIndicator = styled.div<{ show: boolean; isLoading: boolean }>`
  svg {
    height: 1rem;
    width: 1rem;
    transform: rotateZ(-90deg);
    animation: ${(p) =>
      p.isLoading
        ? css`
            ${loadAnimate} 2s linear infinite
          `
        : ''};
  }

  .path {
    stroke: ${(p) => p.theme.color.bg.blue};
    stroke-linecap: round;
    stroke-dasharray: 150;
    stroke-dashoffset: ${(p) => (p.isLoading ? '-25' : '-125')};
    transition: all 0.5s;
    animation: ${(p) =>
      p.show
        ? css`
            ${pollAnimate} 20s linear
          `
        : ''};
  }
`;

const PollLoader: React.FC<PollLoaderProps> = ({ status, preloadStatus }) => {
  const { t } = useTranslation();
  return (
    <PollLoaderContainer
      show={['Ok', 'Error', 'Loading'].includes(preloadStatus) && status === 'NotAsked'}
      preloadStatus={preloadStatus}
    >
      <PollWaitingIndicator
        show={preloadStatus === 'Ok' || preloadStatus === 'Error'}
        isLoading={preloadStatus === 'Loading'}
        title={t('task.poll-loader-msg')}
      >
        <svg className="spinner" viewBox="0 0 50 50">
          <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
        </svg>
      </PollWaitingIndicator>
    </PollLoaderContainer>
  );
};

//
// Style
//

const LogListContainer = styled.div`
  background: ${(p) => p.theme.color.bg.light};
  border-bottom: ${(p) => p.theme.border.thinNormal};
  font-family: monospace;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
  white-space: pre-wrap;
`;

const LogLine = styled.div`
  display: flex;
  transition: backgorund 0.15s;
  padding: 0.25rem 1rem 0 1rem;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const LogLineNumber = styled.div`
  opacity: 0.6;
  font-size: 0.75rem;
  line-height: 1rem;
  padding-right: 0.5rem;
  min-width: 3rem;
  user-select: none;
`;

const LogLineText = styled.div`
  word-break: break-all;
`;

const ScrollToBottomButton = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;

  background: rgba(0, 0, 0, 0.5);
  color: ${(p) => p.theme.color.text.white};
`;

export default LogList;
