import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Icon from '../Icon';
import { PopoverWrapper } from '../Popover';

type HelpMenuLink = {
  href: string;
  label: string;
};

const links = [
  { href: 'https://slack.com/', label: 'Join our Slack channel' },
  { href: 'https://metaflow.org/', label: 'Metaflow help docs' },
  { href: 'https://github.com/Netflix/metaflow', label: 'Github' },
];

const HelpMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <HelpMenuContainer>
      <Icon name="questionCircled" size="sm" onClick={() => setOpen(!open)} />
      <PopoverContainer show={open}>
        <HelpMenuTitle>
          <span>{t('help.links-and-faq')}</span>
          <Icon name="times" size="sm" onClick={() => setOpen(false)} />
        </HelpMenuTitle>

        {links.map((link) => (
          <HelpMenuLink key={link.href + link.label} href={link.href} target="_blank">
            {link.label}
          </HelpMenuLink>
        ))}
      </PopoverContainer>
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

export default HelpMenu;
