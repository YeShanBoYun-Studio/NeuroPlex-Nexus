import React from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageSelect = (lang: 'en' | 'zh') => {
        setLanguage(lang);
        handleClose();
    };

    return (
        <>
            <Tooltip title="Switch Language">
                <IconButton
                    color="inherit"
                    onClick={handleClick}
                >
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem 
                    onClick={() => handleLanguageSelect('en')}
                    selected={language === 'en'}
                >
                    English
                </MenuItem>
                <MenuItem 
                    onClick={() => handleLanguageSelect('zh')}
                    selected={language === 'zh'}
                >
                    中文
                </MenuItem>
            </Menu>
        </>
    );
};
