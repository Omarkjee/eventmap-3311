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
import {
  EventDetails,
  fetchEvents,
  fetchEventById,
  cleanupOldEvents,
  cleanupFirestoreRSVPEvents
} from './utils/firebaseEvents';

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [hasRedirectedAfterLogin, setHasRedirectedAfterLogin] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<EventDetails | undefined>(undefined);
  const [markers, setMarkers] = useState<Array<{ lat: number, lng: number }>>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    updateEvents();
  }, []);

  useEffect(() => {
    const runCleanups = async () => {
      try {
        // Run cleanup for old events
        await cleanupOldEvents();

        // Run cleanup for user RSVPs if logged in
        if (currentUserId) {
          await cleanupFirestoreRSVPEvents(currentUserId);
        }

        // Refresh events after cleanup
        updateEvents();
      } catch (error) {
        console.error("Error running cleanups: ", error);
      }
    };

    runCleanups();
  }, [currentUserId]);

  const updateEvents = async () => {
    try {
      const fetchedEvents = await fetchEvents();
      const now = new Date();
      const currentAndUpcomingEvents = fetchedEvents.filter(event => new Date(event.end_time) >= now);
      setEvents(currentAndUpcomingEvents);
      setSelectedEventId(null);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };

  const clearDroppedPin = () => {
    setMarkers([]); // Clear markers array in Map component
  };

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
    // Check the pathname to update activeSection correctly
    const pathParts = location.pathname.split('/');
  
    if (pathParts[1] === 'events' && pathParts[2]) {
      // Handling case for viewing a specific event
      setActiveSection('viewEvent');
      setSelectedEventId(pathParts[2]);
    } else if (pathParts[1] === 'host') {
      // Handling case for the 'host' section (for creating or editing events)
      setActiveSection('host');
      setSelectedEventId(null); // Ensure no event is selected when creating a new one
    } else if (pathParts[1] === 'notifications') {
      // Handling case for the 'notifications' section
      setActiveSection('notifications');
    } else {
      // Default to events page
      setActiveSection('events');
    }
  }, [location.pathname]);  // Trigger when the URL changes
  
  

  const navigateToHostEvent = (eventId?: string) => {
    if (eventId) {
      // Edit existing event
      setSelectedEventId(eventId);
      setActiveSection('host');
    } else {
      // Create new event
      setSelectedEventId(null);
      setEventToEdit(undefined); // Clear previous event details
      setActiveSection('host');
    }
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

  const handleNavClick = async (section: string) => {
    setActiveSection(section);
    if (section !== 'viewEvent') {
      setSelectedEventId(null); // Clear selected event ID when not viewing an event
    }
    if (section !== 'host') {
      setIsDroppingPin(false);  // Disable pin dropping when not in host section
    }
    if (section === 'host') {
      setSelectedEventId(null); // Clear selected event ID
      setEventToEdit(undefined); // Clear event data to prevent pre-fill
    }
    if (section === 'notifications' || section === 'events') {
      try {
        // Run cleanups on navigation to notifications or events
        await cleanupOldEvents();
        if (currentUserId) {
          await cleanupFirestoreRSVPEvents(currentUserId);
        }
        updateEvents();
      } catch (error) {
        console.error("Error running cleanups during navigation: ", error);
      }
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
  
      // Check if the user is viewing an event
      if (activeSection === 'viewEvent') {
        // If viewing an event, just show the snackbar without redirecting
        setSnackbarMessage('Successfully logged out!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        // Otherwise, navigate to the events page
        setSnackbarMessage('Successfully logged out!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        navigate('/events'); // Redirect to the events page
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
                setIsDroppingPin={setIsDroppingPin}
                eventLocation={eventLocation}
                setEventLocation={setEventLocation}
                eventId={selectedEventId}
                eventDetails={eventToEdit}
                refreshEvents={updateEvents}
                setActiveSection={setActiveSection}
                setSelectedEventId={setSelectedEventId}
                clearDroppedPin={clearDroppedPin}
            />
        );
      case 'viewEvent':
        return selectedEventId ? <ViewEvent eventId={selectedEventId}
                                            navigateToEditEvent={navigateToHostEvent}
                                            currentUserId={currentUserId}
                                            currentUserEmail={currentUserEmail}
        /> : null;
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
        currentUserEmail={currentUserEmail ?? undefined}
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
              markers={markers}
              setMarkers={setMarkers}
              clearDroppedPin={clearDroppedPin}
            />
          </Box>
        </Grid>
      </Grid>

      <Dialog open={logoutDialogOpen} onClose={cancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {activeSection === 'viewEvent' || activeSection === 'events'
              ? "Are you sure you want to log out?"
              : "Are you sure you want to log out? You will be redirected to the events page."}
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
