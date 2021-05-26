import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Log as ILog } from '../../types';
import { useTranslation } from 'react-i18next';

//
// Typedef
//

type LogProps = {
  rows: ILog[];
  onShowFullscreen?: () => void;
  fixedHeight?: number;
};

//
// Component
//

const LIST_MAX_HEIGHT = 400;

const LogList: React.FC<LogProps> = ({ rows, fixedHeight }) => {
  const { t } = useTranslation();
  const [stickBottom, setStickBottom] = useState(true);
  const [cache] = useState(
    new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 25,
    }),
  );
  const _list = useRef<List>(null);

  useEffect(() => {
    if (stickBottom && _list) {
      _list.current?.scrollToRow(rows.length);
    }
  }, [rows, stickBottom]);

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

  return (
    <div style={{ flex: '1 1 0' }}>
      {rows.length === 0 && <div>{t('task.no-logs')}</div>}
      {rows.length > 0 && (
        <LogListContainer>
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                ref={_list}
                overscanRowCount={5}
                rowCount={rows.length}
                rowHeight={cache.rowHeight}
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
                    {() => (
                      <LogLine style={style}>
                        <LogLineNumber className="logline-number">{rows[index].row}</LogLineNumber>
                        <LogLineText>{rows[index].line}</LogLineText>
                      </LogLine>
                    )}
                  </CellMeasurer>
                )}
                height={fixedHeight ? fixedHeight - 16 : totalHeight < LIST_MAX_HEIGHT ? totalHeight : LIST_MAX_HEIGHT}
                width={width}
              />
            )}
          </AutoSizer>

          {!stickBottom && (
            <ScrollToBottomButton onClick={() => setStickBottom(true)}>
              {t('run.scroll-to-bottom')}
            </ScrollToBottomButton>
          )}
        </LogListContainer>
      )}
    </div>
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
  min-width: 2.1875rem;
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
