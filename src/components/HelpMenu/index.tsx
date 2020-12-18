import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiHttp } from '../../constants';
import styled from 'styled-components';
import Icon from '../Icon';
import { PopoverWrapper } from '../Popover';
import { BigButton } from '../Button';
import TimezoneSelector from './TimezoneSelector';
import DebugSelector from './DebugSelector';

type HelpMenuLink = {
  href: string;
  label: string;
};

const DEFAULT_LINKS = [
  { href: 'https://docs.metaflow.org/', label: 'Metaflow documentation' },
  { href: 'https://github.com/Netflix/metaflow', label: 'Github' },
];

const HelpMenu: React.FC = () => {
  const [links, setLinks] = useState<HelpMenuLink[]>(DEFAULT_LINKS);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetch(apiHttp('/links'), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json().then((data) => {
            if (Array.isArray(data)) {
              setLinks(data);
            }
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  return (
    <HelpMenuContainer>
      <BigButton onClick={() => setOpen(!open)} size="sm" variant="primaryText" data-testid="helpmenu-toggle">
        <span>{t('help.quick-links')}</span>
      </BigButton>

      <PopoverContainer show={open} data-testid="helpmenu-popup">
        <HelpMenuTitle>
          <span>{t('help.quick-links')}</span>
          <Icon name="times" size="sm" onClick={() => setOpen(false)} data-testid="helpmenu-close" />
        </HelpMenuTitle>

        {links.map((link) => (
          <HelpMenuLink key={link.href + link.label} href={link.href} target="_blank" data-testid="helpmenu-link">
            {link.label}
          </HelpMenuLink>
        ))}

        <TimezoneSelector />

        <DebugSelector />
      </PopoverContainer>
      {open && <HelpMenuClickOverlay onClick={() => setOpen(false)} data-testid="helpmenu-click-overlay" />}
    </HelpMenuContainer>
  );
};

const HelpMenuContainer = styled.div`
  position: relative;
  font-size: 14px;

  i {
    cursor: pointer;
  }
`;

const PopoverContainer = styled(PopoverWrapper)`
  top: 110%;
  right: 0;
  left: auto;
`;

const HelpMenuTitle = styled.div`
  justify-content: space-between;
  padding: 0.25rem 0.5rem 0.75rem 1rem;
  display: flex;
  margin: 0 -0.5rem 0.25rem;
  width: 256px;
  border-bottom: ${(p) => p.theme.border.thinNormal};

  span {
    font-weight: 500;
  }

  i {
    color: ${(p) => p.theme.color.text.mid};
  }
`;

const HelpMenuLink = styled.a`
  display: flex;
  padding: 0.5rem 0.5rem;
  color: ${(p) => p.theme.color.text.mid};
  text-decoration: none;
  &:hover {
    color: ${(p) => p.theme.color.text.blue};
  }
`;

const HelpMenuClickOverlay = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
`;

export const HelpMenuRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  width: 100%;

  .field {
    width: 100%;
    border: 1px solid #e9e9e9;
    border-radius: 3px;
  }
`;

export default HelpMenu;
