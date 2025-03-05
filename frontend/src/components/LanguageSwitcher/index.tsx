import React from 'react';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { LocaleKey } from '../../types/translations';

export function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages, t, tk } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (locale: LocaleKey) => {
    setLanguage(locale);
    handleClose();
  };

  const currentLanguage = availableLanguages.find(lang => lang.code === language);
  
  return (
    <>
      <IconButton
        color="inherit"
        aria-label={t(tk.common.language)}
        onClick={handleClick}
        aria-controls={anchorEl ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        title={t(tk.common.language)}
      >
        {currentLanguage?.icon}
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
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
        {availableLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === language}
            onClick={() => handleLanguageSelect(lang.code)}
            role="option"
            aria-selected={lang.code === language}
          >
            {lang.icon && <ListItemIcon>{lang.icon}</ListItemIcon>}
            <ListItemText 
              primary={lang.nativeName}
              secondary={lang.name}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;
