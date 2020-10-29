import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Log as ILog } from '../../types';
import { ItemRow } from '../Structure';
import Button from '../Button';
import { useTranslation } from 'react-i18next';
import useComponentSize from '@rehooks/component-size';
import Icon from '../Icon';
import copy from 'copy-to-clipboard';
import { NotificationType, useNotifications } from '../Notifications';

type LogProps = {
  rows: ILog[];
  onShowFullscreen?: () => void;
  fixedHeight?: number;
};

const LIST_MAX_HEIGHT = 400;

const LogList: React.FC<LogProps> = ({ rows, onShowFullscreen, fixedHeight }) => {
  const { addNotification } = useNotifications();
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

  const totalHeight = rows.reduce((val, _item, index) => {
    return val + (cache.getHeight(index, 0) || 0);
  }, 0);

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
                    <LogLine
                      style={style}
                      onClick={() => {
                        copy(rows[index].line);
                        addNotification({
                          type: NotificationType.Info,
                          message: t('task.copied'),
                        });
                      }}
                    >
                      <LogLineNumber className="logline-number">{rows[index].row}</LogLineNumber>
                      <LogLineText>{rows[index].line}</LogLineText>
                    </LogLine>
                  )}
                </CellMeasurer>
              )}
              height={
                fixedHeight
                  ? fixedHeight - (ItemRowSize.height || 16)
                  : totalHeight < LIST_MAX_HEIGHT
                  ? totalHeight
                  : LIST_MAX_HEIGHT
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
        {onShowFullscreen && (rows.length > 1 || totalHeight > LIST_MAX_HEIGHT) && (
          <>
            <Button onClick={onShowFullscreen} withIcon>
              <Icon name="maximize" />
              <span>{t('run.show-fullscreen')}</span>
            </Button>
          </>
        )}
        {onShowFullscreen && (
          <Button
            onClick={() => {
              copy(rows.map((item) => item.line).join('\n'));
              addNotification({
                type: NotificationType.Info,
                message: t('task.copied'),
              });
            }}
          >
            <span>{t('task.copy-logs-to-clipboard')}</span>
          </Button>
        )}
      </ItemRow>
    </div>
  );
};

const LogListContainer = styled.div`
  background: ${(p) => p.theme.color.bg.light};
  border-bottom: ${(p) => p.theme.border.thinLight};
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
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const LogLineNumber = styled.div`
  opacity: 0.6;
  font-size: 12px;
  line-height: 16px;
  padding-right: 0.5rem;
  min-width: 35px;
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
  border-radius: 4px;

  background: rgba(0, 0, 0, 0.5);
  color: ${(p) => p.theme.color.text.white};
`;

export default LogList;
