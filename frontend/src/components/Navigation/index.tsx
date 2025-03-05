import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Message as MessageIcon, Forum as ForumIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { NavigationItem, NavigationProps } from './types';

const navItems: NavigationItem[] = [
  {
    path: '/relay',
    labelKey: 'workflow.relay.title',
    icon: <MessageIcon />
  },
  {
    path: '/debate',
    labelKey: 'workflow.debate.title',
    icon: <ForumIcon />
  },
  {
    path: '/custom',
    labelKey: 'workflow.custom.title',
    icon: <SettingsIcon />
  }
];

export function Navigation({ onItemClick }: NavigationProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <List>
      {navItems.map(({ path, labelKey, icon }) => (
        <ListItem key={path} disablePadding>
          <ListItemButton
            selected={location.pathname === path || (path === '/relay' && location.pathname === '/')}
            onClick={() => handleNavigation(path)}
          >
            {icon && <ListItemIcon>{icon}</ListItemIcon>}
            <ListItemText primary={t(labelKey)} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

export default Navigation;
