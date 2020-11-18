import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiHttp } from '../../constants';
import styled from 'styled-components';
import Icon from '../Icon';
import { PopoverWrapper } from '../Popover';
import Button from '../Button';
import { TimezoneContext } from '../TimezoneProvider';

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
  const { timezone, updateTimezone } = useContext(TimezoneContext);

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
      <ToggleButton
        onClick={() => setOpen(!open)}
        withIcon
        size="sm"
        variant="primaryText"
        data-testid="helpmenu-toggle"
      >
        <span>{t('help.quick-links')}</span>
        <Icon name="external" size="xs" />
      </ToggleButton>
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

        <div>
          <div>Current zone {`GMT${timezone > 0 ? '+' : ''}${timezone}`}</div>
          <div>
            <button
              onClick={() => {
                updateTimezone(timezone <= -12 ? 12 : timezone - 1);
              }}
            >
              -
            </button>
            <button
              onClick={() => {
                updateTimezone(timezone >= 12 ? -12 : timezone + 1);
              }}
            >
              +
            </button>
          </div>
        </div>
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

const ToggleButton = styled(Button)`
  line-height: 1.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
  border-color: ${(p) => p.theme.color.bg.blue};
  &:hover {
    background: ${(p) => p.theme.color.bg.blueLight};
  }
`;

const PopoverContainer = styled(PopoverWrapper)`
  top: 110%;
  right: 0;
  left: auto;
`;

const HelpMenuTitle = styled.div`
  justify-content: space-between;
  padding: 0.25rem 0.5rem 0.75rem 1.5rem;
  display: flex;
  margin: 0 -0.5rem 0.25rem;
  width: 256px;
  border-bottom: ${(p) => p.theme.border.thinLight};

  span {
    font-weight: 500;
  }

  i {
    color: ${(p) => p.theme.color.text.mid};
  }
`;

const HelpMenuLink = styled.a`
  display: flex;
  padding: 0.5rem 1rem;
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

export default HelpMenu;
