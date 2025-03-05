import React from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  SettingsBrightness as SystemIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../contexts/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ThemeMode } from '../../types/theme';

export function ThemeToggle() {
  const { colorMode, setColorMode } = useThemeMode();
  const { t, tk } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setColorMode(mode);
    handleClose();
  };

  const modes: Array<{ value: ThemeMode; label: string; icon: React.ReactElement }> = [
    {
      value: 'light',
      label: t(tk.common.theme.light),
      icon: <LightIcon />,
    },
    {
      value: 'dark',
      label: t(tk.common.theme.dark),
      icon: <DarkIcon />,
    },
    {
      value: 'system',
      label: t(tk.common.theme.system),
      icon: <SystemIcon />,
    },
  ];

  const currentIcon = React.useMemo(() => {
    switch (colorMode) {
      case 'light':
        return <LightIcon />;
      case 'dark':
        return <DarkIcon />;
      default:
        return <SystemIcon />;
    }
  }, [colorMode]);

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        color="inherit"
        aria-label={t(tk.common.theme.change)}
        title={t(tk.common.theme.change)}
        aria-controls={anchorEl ? 'theme-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
      >
        {currentIcon}
      </IconButton>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
          role: 'listbox',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {modes.map(({ value, label, icon }) => (
          <MenuItem
            key={value}
            onClick={() => handleThemeChange(value)}
            selected={colorMode === value}
            role="option"
            aria-selected={colorMode === value}
          >
            <ListItemIcon sx={{ mr: 1 }}>
              {icon}
            </ListItemIcon>
            <ListItemText primary={label} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default ThemeToggle;
