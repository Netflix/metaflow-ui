import React from 'react';
import styled, { css } from 'styled-components';

//
// Typedef
//

type HandleProps = {
  which: 'left' | 'right';
  label: string;
  onDragStart: () => void;
  isZoomed: boolean;
  stackText?: boolean;
};

//
// Component
//

const MinimapHandle: React.FC<HandleProps> = ({ label, onDragStart, which, isZoomed, stackText }) => (
  <MiniTimelineHandle
    style={which === 'right' ? { right: '-5px' } : { left: '-5px' }}
    onMouseDown={() => onDragStart()}
  >
    <MiniTimelineIconLine />
    <MiniTimelineIconLine />
    <MiniTimelineIconLine />
    <MiniTimelineLabel which={which} isZoomed={isZoomed} stackText={stackText}>
      {label}
    </MiniTimelineLabel>
  </MiniTimelineHandle>
);

//
// Style
//

const MiniTimelineHandle = styled.div`
  position: absolute;
  top: 0.4375rem;
  height: 1.8125rem;
  width: 0.625rem;
  background: ${(p) => p.theme.color.bg.blue};
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const MiniTimelineIconLine = styled.div`
  height: 1px;
  width: 0.25rem;
  background: ${(p) => p.theme.color.bg.white};
  margin-bottom: 2px;
`;

const LeftLabelPositioning = css<{ isZoomed: boolean }>`
  ${(p) => (p.isZoomed ? 'right: 100%;' : 'left: 0%')}
`;

const RightLabelPositioning = css<{ isZoomed: boolean }>`
  ${(p) => (p.isZoomed ? 'left: 0%' : 'right: 100%;')}
`;

const MiniTimelineLabel = styled.div<{ which: 'left' | 'right'; isZoomed: boolean; stackText?: boolean }>`
  position: absolute;
  top: 3.125rem;

  right: ${(p) => (p.which === 'right' ? '100%' : 'none')};
  font-size: 0.875rem;
  white-space: ${(p) => (p.stackText && p.isZoomed ? 'none' : 'pre')};

  ${(p) => (p.which === 'left' ? LeftLabelPositioning : RightLabelPositioning)}
`;

export default MinimapHandle;
