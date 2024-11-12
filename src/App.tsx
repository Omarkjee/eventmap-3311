import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Grid, Box, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Button, Snackbar, Alert,
} from '@mui/material';
import NavBar from './components/NavBar';
import Map from './components/Map';
import EventsList from './components/EventsList';
import Notifications from './components/Notifications';
import HostEvent from './components/HostEvent';
import ViewEvent from './components/ViewEvent';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { logOut } from './utils/firebaseAuth';
import { EventDetails, fetchEvents } from './utils/firebaseEvents';

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [hasRedirectedAfterLogin, setHasRedirectedAfterLogin] = useState<boolean>(false);
  
  // States for pin-dropping functionality
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });

  const navigate = useNavigate();
  const location = useLocation();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

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

        if (!hasRedirectedAfterLogin && location.pathname !== `/events/${selectedEventId}`) {
          setActiveSection('events');
          navigate('/events');
          setHasRedirectedAfterLogin(true);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUserId(null);
        setCurrentUserEmail(null);
        setHasRedirectedAfterLogin(false);
      }
    });
    return () => unsubscribe();
  }, [navigate, hasRedirectedAfterLogin, selectedEventId, location.pathname]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const eventIdFromUrl = pathParts[2];
    if (pathParts[1] === 'events' && eventIdFromUrl) {
      setActiveSection('viewEvent');
      setSelectedEventId(eventIdFromUrl);
    }
  }, [location.pathname]);

  const navigateToEditEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveSection('host');
  };

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    if (section !== 'host') {
      setIsDroppingPin(false);  // Disable pin dropping when not in host section
    }

    switch (section) {
      case 'events':
        navigate('/events');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'host':
        navigate('/host');
        break;
      default:
        navigate('/events');
    }
  };

  const viewEvent = (eventId: string) => {
    setActiveSection('viewEvent');
    setSelectedEventId(eventId);
    navigate(`/events/${eventId}`);
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    if (isDroppingPin) {
      setEventLocation(latLng);
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await logOut();
      setLogoutDialogOpen(false);
      sessionStorage.setItem('logout', 'true');

      if (activeSection === 'host' || activeSection === 'notifications') {
        window.location.reload();
      } else {
        setSnackbarMessage('Successfully logged out!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        navigate('/events');
      }
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem('logout') === 'true') {
      setSnackbarMessage('Successfully logged out!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      sessionStorage.removeItem('logout');
    }
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventsList viewEvent={viewEvent} events={events} />;
      case 'notifications':
        return <Notifications />;
      case 'host':
        return (
          <HostEvent
            eventId={selectedEventId}
            setIsDroppingPin={setIsDroppingPin}
            eventLocation={eventLocation}
            setEventLocation={setEventLocation}
          />
        );
      case 'viewEvent':
        return selectedEventId ? <ViewEvent eventId={selectedEventId} currentUserId={currentUserId} currentUserEmail={currentUserEmail} /> : null;
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

      <Dialog open={logoutDialogOpen} onClose={cancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out? You will be redirected to the events page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmLogout} color="secondary">
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
