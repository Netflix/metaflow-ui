import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiHttp } from '../../constants';
import styled from 'styled-components';
import Icon from '../Icon';
import { PopoverWrapper } from '../Popover';
import Button from '../Button';

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
      <ToggleButton onClick={() => setOpen(!open)} withIcon size="sm" variant="primaryText">
        <span>{t('help.quick-links')}</span>
        <Icon name="external" size="xs" onClick={() => setOpen(!open)} />
      </ToggleButton>
      <PopoverContainer show={open}>
        <HelpMenuTitle>
          <span>{t('help.quick-links')}</span>
          <Icon name="times" size="sm" onClick={() => setOpen(false)} />
        </HelpMenuTitle>

        {links.map((link) => (
          <HelpMenuLink key={link.href + link.label} href={link.href} target="_blank">
            {link.label}
          </HelpMenuLink>
        ))}
      </PopoverContainer>
      {open && <HelpMenuClickOverlay onClick={() => setOpen(false)} />}
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
  border-bottom: 1px solid #e9e9e9;

  span {
    font-weight: 500;
  }

  i {
    color: #888;
  }
`;

const HelpMenuLink = styled.a`
  display: flex;
  padding: 0.5rem 1rem;
  color: #333;
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
