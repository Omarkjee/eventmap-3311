import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';

interface NavBarProps {
    onNavClick: (section: string) => void;
    isAuthenticated: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ onNavClick, isAuthenticated }) => {
    return (
        <AppBar position="static">  {/* Use Material-UI's AppBar */}
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Campus Banner
                </Typography>
                <Button color="inherit" onClick={() => onNavClick('events')}>
                    Events
                </Button>
                <Button color="inherit" onClick={() => onNavClick('host')}>
                    Host Event
                </Button>
                <Button color="inherit" onClick={() => onNavClick('friends')}>
                    Friends
                </Button>
                <Button color="inherit" onClick={() => onNavClick('notifications')}>
                    Notifications
                </Button>
                {isAuthenticated ? (
                    <Button color="inherit" onClick={() => onNavClick('logout')}>
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
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;

