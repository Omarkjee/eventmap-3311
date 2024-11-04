import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Grid, Box } from '@mui/material';
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
import { EventDetails, fetchEvents } from './utils/firebaseEvents';

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });
  const [events, setEvents] = useState<EventDetails[]>([]);
  const navigate = useNavigate();
  const location = useLocation(); // Access the current location
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null); // State for current user email

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
      setIsAuthenticated(!!user);
      setCurrentUserId(user ? user.uid : null); // Store the user ID when a user is logged in
      setCurrentUserEmail(user ? user.email : null); // Store the user email when a user is logged in
    });
    return () => unsubscribe();
  }, []);

  // Check the URL for an event ID
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const eventIdFromUrl = pathParts[2]; // Assuming the URL structure is /events/:eventId
    if (pathParts[1] === 'events' && eventIdFromUrl) {
      setActiveSection('viewEvent');
      setSelectedEventId(eventIdFromUrl); // Set the selected event ID from URL
    }
  }, [location.pathname]); // Run this effect when the pathname changes

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    if (section !== 'host') {
      setIsDroppingPin(false);
    }
  };

  const viewEvent = (eventId: string) => {
    setActiveSection('viewEvent');
    setSelectedEventId(eventId);
    navigate(`/events/${eventId}`); // Navigate to the specific event URL
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventLocation(latLng);
  };

  const handleLogout = async () => {
    await logOut();
    alert("Logout successful!");
    setActiveSection("events");
    navigate('/events');  // Redirect to event list after logout
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventsList viewEvent={viewEvent} events={events} />;
      case 'login':
        return <Login />;
      case 'notifications':
        return <Notifications />;
      case 'signup':
        return <Signup />;
      case 'host':
        return <HostEvent setIsDroppingPin={setIsDroppingPin} eventLocation={eventLocation} />;
      case 'viewEvent':
        return selectedEventId ? <ViewEvent eventId={selectedEventId} currentUserId={currentUserId} currentUserEmail={currentUserEmail} /> : null; // Pass both IDs
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
        currentUserEmail={currentUserEmail} // Pass the current user email to NavBar
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
    </Container>
  );
}

export default App;
