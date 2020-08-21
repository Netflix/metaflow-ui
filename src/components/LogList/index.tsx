import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Log as ILog } from '../../types';
import { CheckboxField } from '../Form';
import { ItemRow } from '../Structure';

type LogProps = {
  rows: ILog[];
};

const ROW_HEIGHT = 20;

const LogList: React.FC<LogProps> = ({ rows }) => {
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

  return (
    <div>
      <ItemRow>
        <CheckboxField label="stick to bottom" checked={stickBottom} onChange={() => setStickBottom(!stickBottom)} />
        <div>{rows.length}</div>
      </ItemRow>
      <LogListContainer>
        <AutoSizer disableHeight>
          {({ width }) => (
            <List
              ref={_list}
              overscanRowCount={5}
              rowCount={rows.length}
              rowHeight={cache.rowHeight}
              deferredMeasurementCache={cache}
              rowRenderer={({ index, style, key, parent }) => (
                <CellMeasurer cache={cache} columnIndex={0} key={key} rowIndex={index} parent={parent}>
                  {() => (
                    <LogLine style={style}>
                      <LogLineNumber>{rows[index].row}</LogLineNumber>
                      <div>{rows[index].line}</div>
                    </LogLine>
                  )}
                </CellMeasurer>
              )}
              height={ROW_HEIGHT * rows.length > 400 ? 400 : ROW_HEIGHT * rows.length}
              width={width}
            />
          )}
        </AutoSizer>
      </LogListContainer>
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
  padding: 0.25rem 1rem 0;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const LogLineNumber = styled.div`
  width: 40px;
  flex-shrink: 0;
  opacity: 0.6;
  font-size: 12px;
  line-height: 14px;
`;

export default LogList;
