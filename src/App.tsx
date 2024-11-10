import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Grid, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar } from '@mui/material';
import NavBar from './components/NavBar';
import Map from './components/Map';
import EventsList from './components/EventsList';
import Login from './components/Login';
import Notifications from './components/Notifications';
import Signup from './components/Signup';
import HostEvent from './components/HostEvent';
import ViewEvent from './components/ViewEvent';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { logOut } from './utils/firebaseAuth';
import { EventDetails, fetchEvents, fetchEventById } from './utils/firebaseEvents';

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [showSnackbarOnLogin, setShowSnackbarOnLogin] = useState<boolean>(false);
  const [hasRedirectedAfterLogin, setHasRedirectedAfterLogin] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<EventDetails | undefined>(undefined);


  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await fetchEvents();
        const now = new Date();
        const currentAndUpcomingEvents = fetchedEvents.filter(event => new Date(event.end_time) >= now);
        setEvents(currentAndUpcomingEvents);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUserId(user.uid);
        setCurrentUserEmail(user.email);

        if (showSnackbarOnLogin) {
          // Show Snackbar on successful sign-in
          setSnackbarMessage('Successfully signed in!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setShowSnackbarOnLogin(false); // Reset the flag
        }

        // Redirect to events only if not redirected before
        if (!hasRedirectedAfterLogin) {
          setActiveSection('events');
          navigate('/events');
          setHasRedirectedAfterLogin(true); // Set the flag after redirection
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUserId(null);
        setCurrentUserEmail(null);
        setHasRedirectedAfterLogin(false); // Reset the flag on logout
      }
    });
    return () => unsubscribe();
  }, [navigate, showSnackbarOnLogin, hasRedirectedAfterLogin]);

  useEffect(() => {
    const savedSection = localStorage.getItem('activeSection');
    const savedEventId = localStorage.getItem('selectedEventId');

    if (savedSection) {
      setActiveSection(savedSection);
    }

    if (savedEventId) {
      setSelectedEventId(savedEventId);
      if (savedSection === 'viewEvent') {
        navigate(`/events/${savedEventId}`);
      }
    }
  }, [navigate]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const eventIdFromUrl = pathParts[2];
    if (pathParts[1] === 'events' && eventIdFromUrl) {
      setActiveSection('viewEvent');
      setSelectedEventId(eventIdFromUrl);
      localStorage.setItem('activeSection', 'viewEvent');
      localStorage.setItem('selectedEventId', eventIdFromUrl);
    }
  }, [location.pathname]);

  const navigateToEditEvent = (eventId: string) => {
    setSelectedEventId(eventId); // Set the event ID to be edited
    setActiveSection('host'); // Switch to the host section
  };

  useEffect(() => {
    if (selectedEventId && activeSection === 'host') {
      // Fetch the event details to edit when we are in 'host' mode and have an event selected
      const fetchEventDetails = async () => {
        const event = await fetchEventById(selectedEventId);
        if (event) {
          setEventToEdit({
            ...event,
            start_time: event.start_time instanceof Date ? event.start_time.toISOString() : event.start_time,
            end_time: event.end_time instanceof Date ? event.end_time.toISOString() : event.end_time,
          });
        }
      };
      fetchEventDetails();
    } else {
      // Clear eventToEdit when not in edit mode
      setEventToEdit(undefined);
    }
  }, [selectedEventId, activeSection]);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    if (section !== 'host') {
      setIsDroppingPin(false);
    }

    switch (section) {
      case 'events':
        navigate('/events');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'signup':
        navigate('/signup');
        break;
      case 'host':
        navigate('/host');
        break;
      default:
        navigate('/events');
    }
    localStorage.setItem('activeSection', section);
  };

  const viewEvent = (eventId: string) => {
    setActiveSection('viewEvent');
    setSelectedEventId(eventId);
    navigate(`/events/${eventId}`);
    localStorage.setItem('activeSection', 'viewEvent');
    localStorage.setItem('selectedEventId', eventId);
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventLocation(latLng);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setLogoutDialogOpen(true);
      setCountdown(5); // Start countdown timer to 5 seconds
      localStorage.removeItem('activeSection');
      localStorage.removeItem('selectedEventId');
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (logoutDialogOpen) {
      const countdownInterval = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            clearInterval(countdownInterval);
            setLogoutDialogOpen(false); // Close dialog
            setActiveSection('login'); // Only set active section to login here
            navigate('/login'); // Redirect to login page
            setSnackbarMessage('Successfully logged out!'); // Set logout success message
            setSnackbarSeverity('success'); // Set severity
            setSnackbarOpen(true); // Open the snackbar
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval); // Cleanup interval on unmount or dialog close
    }
  }, [logoutDialogOpen, navigate]);

  const closeDialog = () => {
    setLogoutDialogOpen(false); // Close dialog immediately
    setActiveSection('login'); // Set active section to login
    navigate('/login'); // Navigate to login page
    setSnackbarMessage('Successfully logged out!'); // Set logout success message
    setSnackbarSeverity('success'); // Set severity
    setSnackbarOpen(true); // Open the snackbar
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventsList viewEvent={viewEvent} events={events} />;
      case 'login':
        return <Login 
          onLoginSuccess={() => setShowSnackbarOnLogin(true)} 
          clearFormOnUnmount={activeSection !== 'login'} // Pass a prop to clear form on unmount
        />; 
      case 'notifications':
        return <Notifications />;
      case 'signup':
        return <Signup />;
      case 'host':
        return (
            <HostEvent
                setIsDroppingPin={setIsDroppingPin}
                eventLocation={eventLocation}
                eventId={selectedEventId}
                eventDetails={eventToEdit}
            />
        );
      case 'viewEvent':
        return selectedEventId ? <ViewEvent eventId={selectedEventId} navigateToEditEvent={navigateToEditEvent} currentUserId={currentUserId} currentUserEmail={currentUserEmail} /> : null;
      default:
        return <EventsList viewEvent={viewEvent} events={events} />;
    }
  };

  return (
    <Container maxWidth="xl">
      <NavBar 
        onNavClick={handleNavClick} 
        onLogout={handleLogout} 
        isAuthenticated={isAuthenticated} 
        currentUserEmail={currentUserEmail}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, bgcolor: 'grey.100', height: { xs: '50vh', md: '100vh' }, overflowY: 'auto' }}>
            {renderActiveSection()}
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ p: 2, height: { xs: '50vh', md: '100vh' } }}>
            <Map
              events={events}
              selectedEventId={selectedEventId}
              isDroppingPin={isDroppingPin}
              onMapClick={handleMapClick}
              viewEvent={viewEvent}
            />
          </Box>
        </Grid>
      </Grid>

      <Dialog open={logoutDialogOpen} onClose={closeDialog}>
        <DialogTitle>Logout Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have successfully logged out. Redirecting to the login page in {countdown} seconds...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Go to Login Now
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Container>
  );
}

export default App;
