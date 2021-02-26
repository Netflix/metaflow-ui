import React from 'react';
import styled from 'styled-components';
import Icon from '../../components/Icon';

const ScrollToTop: React.FC<{ show: boolean; newRunsAvailable: boolean }> = ({ show, newRunsAvailable }) => {
  const textContent = newRunsAvailable ? 'New runs at the top' : 'Scroll to top';
  return (
    <ScrollToTopButton
      show={show}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      // Full width is (letter amount * 8 pixels) + (40px (icon width)) + (12px (margin to right))
      fullWidth={textContent.length * 8 + 40}
    >
      <Icon size="sm" name="toTopArrow" />
      <NewStuffIndicator show={newRunsAvailable} />
      <TextContent>{textContent}</TextContent>
    </ScrollToTopButton>
  );
};

const ScrollToTopButton = styled.div<{ show: boolean; fullWidth: number }>`
  cursor: pointer;
  position: fixed;
  z-index: 999;
  bottom: 1rem;
  right: 1rem;
  background: ${(p) => p.theme.color.bg.blue};
  border-radius: 20px;
  overflow: hidden;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transform: ${(p) => (p.show ? 'translateY(0)' : 'translateY(70px)')};
  transition: transform 0.5s cubic-bezier(0.44, 1.89, 0.55, 0.79), width 0.25s;

  i {
    margin: 0 0.75rem;
    text-align: center;
  }

  &:hover {
    width: ${(p) => `${p.fullWidth}px`};
  }
`;

const NewStuffIndicator = styled.div<{ show: boolean }>`
  position: absolute;
  top: 10px;
  left: 27px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.5s cubic-bezier(0.44, 1.89, 0.55, 0.79);
  transform: ${(p) => (p.show ? 'scale(1)' : 'scale(0)')};
`;

const TextContent = styled.div`
  white-space: nowrap;
  color: #fff;
`;

export default ScrollToTop;
