import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Icon from '@components/Icon';

//
// Typedef
//

type Props = { show: boolean; newRunsAvailable: boolean };

//
// Component
//

const ScrollToTop: React.FC<Props> = ({ show, newRunsAvailable }) => {
  const { t } = useTranslation();
  const textContent = newRunsAvailable ? t('home.new-run-available') : t('home.scroll-to-top');
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

//
// Style
//

const ScrollToTopButton = styled.div<{ show: boolean; fullWidth: number }>`
  cursor: pointer;
  position: fixed;
  z-index: 999;
  bottom: 1rem;
  right: 1rem;
  background: var(--color-bg-brand-primary);
  border-radius: 1.25rem;
  overflow: hidden;
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
  transform: ${(p) => (p.show ? 'translateY(0)' : 'translateY(70px)')};
  transition:
    transform 0.5s cubic-bezier(0.44, 1.89, 0.55, 0.79),
    width 0.25s;

  i {
    margin: 0 0.75rem;
    text-align: center;
  }

  &:hover {
    width: ${(p) => `${p.fullWidth}px`};
  }

  svg path {
    fill: #fff;
  }
`;

const NewStuffIndicator = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0.625rem;
  left: 1.6875rem;
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
