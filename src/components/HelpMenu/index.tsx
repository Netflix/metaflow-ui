import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiHttp } from '../../constants';
import styled, { css } from 'styled-components';
import Icon from '../Icon';
import { PopoverWrapper } from '../Popover';
import { BigButton } from '../Button';
import TimezoneSelector from './TimezoneSelector';
import VERSION_INFO from '../../utils/VERSION';
import FEATURE_FLAGS from '../../utils/FEATURE';
import LaunchIconBlack from '../../assets/launch_black.svg';
import { Link } from 'react-router-dom';
import useOnKeyPress from '../../hooks/useOnKeyPress';

type HelpMenuLink = {
  href: string;
  label: string;
};

const INTERNAL_LINKS: HelpMenuLink[] = [{ href: '/notifications', label: 'help.notifications' }];

const DEFAULT_LINKS = [
  { href: 'https://docs.metaflow.org/', label: 'Documentation' },
  { href: 'https://github.com/Netflix/metaflow', label: 'Github' },
];

//
// Additional menu that is available on top right corner of the page.
//

const HelpMenu: React.FC = () => {
  const [links, setLinks] = useState<HelpMenuLink[]>(DEFAULT_LINKS);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useOnKeyPress('Escape', () => setOpen(false));

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

        <TimezoneSelectorContainer>
          <TimezoneSelector />
        </TimezoneSelectorContainer>

        {INTERNAL_LINKS.map((link) => (
          <Link
            key={link.href + link.label}
            to={link.href}
            onClick={() => {
              setOpen(false);
            }}
            style={{ textDecoration: 'none' }}
          >
            <HelpMenuItem data-testid="helpmenu-link-notifications">{t(link.label)}</HelpMenuItem>
          </Link>
        ))}

        {FEATURE_FLAGS.DEBUG_VIEW && (
          <Link
            to="/debug"
            onClick={() => {
              setOpen(false);
            }}
            style={{ textDecoration: 'none' }}
          >
            <HelpMenuItem data-testid="helpmenu-link-debug">Debug</HelpMenuItem>
          </Link>
        )}

        {links.map((link) => (
          <StyledHelpMenuLink key={link.href + link.label} href={link.href} target="_blank" data-testid="helpmenu-link">
            {link.label}
          </StyledHelpMenuLink>
        ))}
        {VERSION_INFO.release_version && (
          <VersionContainer>
            <HelpMenuRow title={`${VERSION_INFO.release_version} - ${VERSION_INFO.commit}`}>
              {t('help.application-version')}: {VERSION_INFO.release_version}
            </HelpMenuRow>
            {VERSION_INFO.service_version && (
              <HelpMenuRow>
                {t('help.service-version')}: {VERSION_INFO.service_version}
              </HelpMenuRow>
            )}
          </VersionContainer>
        )}
      </PopoverContainer>
      {open && <HelpMenuClickOverlay onClick={() => setOpen(false)} data-testid="helpmenu-click-overlay" />}
    </HelpMenuContainer>
  );
};

//
// Style
//

const HelpMenuContainer = styled.div`
  position: relative;
  font-size: 0.75rem;

  i {
    cursor: pointer;
  }
`;

const PopoverContainer = styled(PopoverWrapper)`
  top: 0;
  right: 0;
  left: auto;
`;

const TimezoneSelectorContainer = styled.div`
  margin: 1rem 0 0.5rem;
`;

const HelpMenuTitle = styled.div`
  align-items: center;
  border-bottom: var(--border-1-thin);
  display: flex;
  justify-content: space-between;
  margin: 0 -0.5rem 0.5rem;
  padding: 0.25rem 0.5rem 0.75rem 1rem;
  width: 21.875rem;

  span {
    font-weight: 500;
  }

  i {
    color: var(--color-text-secondary);
  }
`;

const HelpMenuItemStyles = css`
  color: var(--color-text-secondary);
  display: flex;
  line-height: 1rem;
  padding: 0.5rem 0.5rem;
  text-decoration: none;

  &:hover {
    color: var(--color-text-highlight);
  }
`;

const StyledHelpMenuLink = styled.a`
  ${HelpMenuItemStyles}

  &:hover:after {
    background-color: var(--color-text-highlight);
  }
  &:after {
    background-color: #666;
    content: '';
    display: inline-block;
    height: 1rem;
    margin: 0 0 0 0.125rem;
    -webkit-mask: url(${LaunchIconBlack}) no-repeat 50% 50%;
    mask: url(${LaunchIconBlack}) no-repeat 50% 50%;
    -webkit-mask-size: cover;
    mask-size: cover;
    width: 1rem;
  }
`;

const HelpMenuItem = styled.div`
  ${HelpMenuItemStyles}
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
    border-radius: var(--radius-primary);
  }
`;

const VersionContainer = styled.div`
  margin: 0 -0.5rem 0.25rem;
  padding: 0.25rem 0.5rem 0;
  color: var(--color-text-secondary);
  border-top: var(--border-primary-thin);
  word-break: break-all;

  > *:last-child {
    padding-bottom: 0;
  }
`;

export default HelpMenu;
