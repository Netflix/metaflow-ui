import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Log as ILog, Log } from '../../types';
import { ItemRow } from '../Structure';
import Button from '../Button';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import copy from 'copy-to-clipboard';
import { NotificationType, useNotifications } from '../Notifications';

type LogProps = {
  rows: ILog[];
  onShowFullscreen?: () => void;
  fixedHeight?: number;
};

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
          <ScrollToBottomButton onClick={() => setStickBottom(true)}>{t('run.scroll-to-bottom')}</ScrollToBottomButton>
        )}
      </LogListContainer>
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
  padding: 0.25rem 1rem 0 1rem;

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

type LogActionBarProps = {
  setFullscreen: () => void;
  name: string;
  data: Log[];
};

export const LogActionBar: React.FC<LogActionBarProps> = ({ setFullscreen, name, data }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  return (
    <ItemRow>
      {data && data.length > 0 && (
        <Button
          withIcon
          onClick={() => {
            copy(data.map((item) => item.line).join('\n'));
            addNotification({
              type: NotificationType.Info,
              message: t('task.all-logs-copied'),
            });
          }}
        >
          <Icon name="copy" />
          <span>{t('task.copy-logs-to-clipboard')}</span>
        </Button>
      )}

      {data && data.length > 0 && (
        <Button
          iconOnly
          onClick={() => {
            downloadString(data.map((log) => log.line).join('\n'), 'text/plain', `logs-${name}.txt`);
          }}
        >
          <Icon name="arrowDown" />
        </Button>
      )}

      {data && data.length > 0 && (
        <Button onClick={() => setFullscreen()} withIcon>
          <Icon name="maximize" />
        </Button>
      )}
    </ItemRow>
  );
};

function downloadString(text: string, fileType: string, fileName: string) {
  const blob = new Blob([text], { type: fileType });

  const a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 1500);
}

export default LogList;
