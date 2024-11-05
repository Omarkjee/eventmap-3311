import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Typography, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface NavBarProps {
    onNavClick: (section: string) => void;
    onLogout: () => void;  
    isAuthenticated: boolean;
    currentUserEmail?: string; // Added currentUserEmail prop
}

const NavBar: React.FC<NavBarProps> = ({ onNavClick, onLogout, isAuthenticated, currentUserEmail }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const toggleDrawer = (open: boolean) => {
        setDrawerOpen(open);
    };

    const handleMenuItemClick = (section: string) => {
        onNavClick(section);
        setDrawerOpen(false);
    };

    // Menu items - only show "Host Event" and "Notifications" if the user is authenticated
    const menuItems = [
        { text: 'Events', section: 'events' },
        ...(isAuthenticated ? [{ text: 'Host Event', section: 'host' }, { text: 'Notifications', section: 'notifications' }] : []), // Conditionally include Host Event and Notifications
    ];

    // Extract the username from the currentUserEmail
    const username = currentUserEmail ? currentUserEmail.split('@')[0] : 'Guest';

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Welcome, {username}!
                    </Typography>

                    {isMobile ? (
                        <>
                            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => toggleDrawer(true)}>
                                <MenuIcon />
                            </IconButton>

                            <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
                                <List>
                                    {menuItems.map((item) => (
                                        <ListItem
                                            key={item.text}
                                            onClick={() => handleMenuItemClick(item.section)}
                                            component="button"
                                        >
                                            <ListItemText primary={item.text} />
                                        </ListItem>
                                    ))}

                                    {isAuthenticated ? (
                                        <ListItem onClick={onLogout} component="button">
                                            <ListItemText primary="Logout" />
                                        </ListItem>
                                    ) : (
                                        <>
                                            <ListItem onClick={() => handleMenuItemClick('login')} component="button">
                                                <ListItemText primary="Login" />
                                            </ListItem>
                                            <ListItem onClick={() => handleMenuItemClick('signup')} component="button">
                                                <ListItemText primary="Sign Up" />
                                            </ListItem>
                                        </>
                                    )}
                                </List>
                            </Drawer>
                        </>
                    ) : (
                        <>
                            {menuItems.map((item) => (
                                <Button key={item.text} color="inherit" onClick={() => onNavClick(item.section)}>
                                    {item.text}
                                </Button>
                            ))}

                            {isAuthenticated ? (
                                <Button color="inherit" onClick={onLogout}>
                                    Logout
                                </Button>
                            ) : (
                                <>
                                    <Button color="inherit" onClick={() => onNavClick('login')}>
                                        Login
                                    </Button>
                                    <Button color="inherit" onClick={() => onNavClick('signup')}>
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </>
    );
};

export default NavBar;
