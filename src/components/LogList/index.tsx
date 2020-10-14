import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Log as ILog } from '../../types';
import { ItemRow } from '../Structure';
import Button from '../Button';
import { useTranslation } from 'react-i18next';
import useComponentSize from '@rehooks/component-size';
import { ROW_HEIGHT } from '../Timeline/VirtualizedTimeline';
import Icon from '../Icon';

type LogProps = {
  rows: ILog[];
  onShowFullscreen?: () => void;
  fixedHeight?: number;
};

// const ROW_HEIGHT = 20;

const LogList: React.FC<LogProps> = ({ rows, onShowFullscreen, fixedHeight }) => {
  const { t } = useTranslation();
  const [stickBottom, setStickBottom] = useState(true);
  const [cache] = useState(
    new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 25,
    }),
  );
  const _list = useRef<List>(null);
  const _itemRow = useRef<HTMLDivElement>(null);
  const ItemRowSize = useComponentSize(_itemRow);

  useEffect(() => {
    if (stickBottom && _list) {
      _list.current?.scrollToRow(rows.length - 1);
    }
  }, [rows, stickBottom]);

  return (
    <div style={{ flex: '1 1 0' }}>
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
                      <div>{rows[index].line}</div>
                      <LogLineNumber className="logline-number">{rows[index].row}</LogLineNumber>
                    </LogLine>
                  )}
                </CellMeasurer>
              )}
              height={
                fixedHeight
                  ? fixedHeight - (ItemRowSize.height || 16)
                  : ROW_HEIGHT * rows.length < 400
                  ? ROW_HEIGHT * rows.length
                  : 400
              }
              width={width}
            />
          )}
        </AutoSizer>

        {!stickBottom && (
          <ScrollToBottomButton onClick={() => setStickBottom(true)}>{t('run.scroll-to-bottom')}</ScrollToBottomButton>
        )}
      </LogListContainer>

      <ItemRow ref={_itemRow} margin="sm">
        {onShowFullscreen && rows.length > 1 && (
          <Button onClick={onShowFullscreen} withIcon>
            <Icon name="maximize" />
            <span>{t('run.show-fullscreen')}</span>
          </Button>
        )}
      </ItemRow>
    </div>
  );
};

const LogListContainer = styled.div`
  background: ${(props) => props.theme.color.bg.light};
  border-bottom: 1px solid ${(props) => props.theme.color.border.light};
  font-family: monospace;
  border-radius: 4px;
  font-size: 14px;
  overflow: hidden;
  white-space: pre-wrap;
`;

const LogLine = styled.div`
  display: flex;
  transition: backgorund 0.15s;
  padding: 0.25rem 40px 0 1rem;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    .logline-number {
      display: block;
    }
  }
`;

const LogLineNumber = styled.div`
  display: none;
  opacity: 0.6;
  font-size: 12px;
  line-height: 14px;
  position: absolute;
  top: 0;
  right: 0;
  line-height: 25px;
  padding-right: 0.5rem;
`;

const ScrollToBottomButton = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;

  background: rgba(0, 0, 0, 0.5);
  color: #fff;
`;

export default LogList;
