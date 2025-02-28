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
} from '@mui/icons-material';

const drawerWidth = 240;

const theme = createTheme({
    palette: {
        primary: {
            main: '#1a237e', // Deep blue
        },
        secondary: {
            main: '#c2185b', // Deep pink
        },
        background: {
            default: '#f5f5f5',
        },
    },
});

export const Layout: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div">
                            NeuraCollab
                        </Typography>
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
                                <ListItemText primary="Relay Writing" />
                            </ListItem>
                            <ListItem component={Link} to="/debate">
                                <ListItemIcon>
                                    <ForumIcon />
                                </ListItemIcon>
                                <ListItemText primary="Debate Mode" />
                            </ListItem>
                            <ListItem component={Link} to="/custom">
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Custom Mode" />
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
