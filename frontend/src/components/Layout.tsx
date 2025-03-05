import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    ThemeProvider,
    createTheme,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Forum as ForumIcon,
    Settings as SettingsIcon,
    Storage as StorageIcon
} from '@mui/icons-material';
import { useTranslation } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

const drawerWidth = 240;

const theme = createTheme({
    palette: {
        primary: {
            main: '#1a237e',
        },
        secondary: {
            main: '#c2185b',
        },
        background: {
            default: '#f5f5f5',
        },
    },
});

export const Layout: React.FC = () => {
    const { t } = useTranslation();

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" noWrap component="div">
                            NeuraCollab
                        </Typography>
                        <LanguageSwitcher />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto' }}>
                        <List>
                            <ListItem component={Link} to="/relay">
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('workflow.relay.title')} />
                            </ListItem>
                            <ListItem component={Link} to="/debate">
                                <ListItemIcon>
                                    <ForumIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('workflow.debate.title')} />
                            </ListItem>
                            <ListItem component={Link} to="/custom">
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('workflow.custom.title')} />
                            </ListItem>
                            <ListItem component={Link} to="/cache-settings">
                                <ListItemIcon>
                                    <StorageIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('settings.cache.title')} />
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    );
};
