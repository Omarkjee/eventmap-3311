import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Login from './Login'; // Ensure path is correct for Login component
import SignUp from './SignUp'; // Ensure path is correct for SignUp component

interface NavBarProps {
  onNavClick: (section: string) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  currentUserEmail?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  onNavClick,
  onLogout,
  isAuthenticated,
  currentUserEmail,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signUpDialogOpen, setSignUpDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success'); // Severity of the snackbar
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleMenuItemClick = (section: string) => {
    onNavClick(section);
    setDrawerOpen(false);
  };

  const handleLoginSuccess = () => {
    setLoginDialogOpen(false);
    setSnackbarMessage('Successfully logged in!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true); // Show snackbar on successful login
  };

  const handleLogoutSuccess = async () => {
    try {
      await onLogout(); // Assuming `onLogout` is a function that handles the logout process.
      // Don't show snackbar on logout
    } catch (error) {
      // You can add error handling here if needed, but no snackbar for logout
      console.error('Logout failed', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false); // Close snackbar
  };

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
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>

              <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
                <List>
                  {[
                    { text: 'Events', section: 'events' },
                    ...(isAuthenticated
                      ? [
                          { text: 'Host Event', section: 'host' },
                          { text: 'Notifications', section: 'notifications' },
                        ]
                      : []),
                  ].map((item) => (
                    <ListItem
                      key={item.text}
                      onClick={() => handleMenuItemClick(item.section)}
                      component="button"
                    >
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}

                  {isAuthenticated ? (
                    <ListItem onClick={handleLogoutSuccess} component="button">
                      <ListItemText primary="Logout" />
                    </ListItem>
                  ) : (
                    <>
                      <ListItem
                        onClick={() => {
                          setLoginDialogOpen(true); // Open login dialog
                          setDrawerOpen(false); // Close drawer
                        }}
                        component="button"
                      >
                        <ListItemText primary="Login" />
                      </ListItem>
                      <ListItem
                        onClick={() => {
                          setSignUpDialogOpen(true); // Open sign-up dialog
                          setDrawerOpen(false); // Close drawer
                        }}
                        component="button"
                      >
                        <ListItemText primary="Sign Up" />
                      </ListItem>
                    </>
                  )}
                </List>
              </Drawer>
            </>
          ) : (
            <>
              {[
                { text: 'Events', section: 'events' },
                ...(isAuthenticated
                  ? [
                      { text: 'Host Event', section: 'host' },
                      { text: 'Notifications', section: 'notifications' },
                    ]
                  : []),
              ].map((item) => (
                <Button key={item.text} color="inherit" onClick={() => onNavClick(item.section)}>
                  {item.text}
                </Button>
              ))}

              {isAuthenticated ? (
                <Button color="inherit" onClick={handleLogoutSuccess}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button color="inherit" onClick={() => setLoginDialogOpen(true)}>
                    Login
                  </Button>
                  <Button color="inherit" onClick={() => setSignUpDialogOpen(true)}>
                    Sign Up
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Login Modal */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
        <DialogContent>
          <Login
            onLoginSuccess={handleLoginSuccess} // Call the success handler here
            clearFormOnUnmount={true}
          />
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog open={signUpDialogOpen} onClose={() => setSignUpDialogOpen(false)}>
        <DialogContent>
          <SignUp
            onSignUpSuccess={() => {
              setSignUpDialogOpen(false);
            }}
            clearFormOnUnmount={true}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for login success */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NavBar;
