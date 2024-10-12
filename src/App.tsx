import { useState, useEffect } from 'react';
import { Container, Grid, Box } from '@mui/material';
import NavBar from './components/NavBar';
import Map from './components/Map';
import EventsList from './components/EventsList';
import FriendsList from './components/FriendsList';
import Login from './components/Login';
import Notifications from './components/Notifications';
import Signup from './components/Signup';
import HostEvent from './components/HostEvent';
import ViewEvent from './components/ViewEvent';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { logOut } from './utils/firebaseAuth';
import {EventDetails, fetchEvents} from './utils/firebaseEvents';  // Assuming this exists

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });
  const [events, setEvents] = useState<EventDetails[]>([]);  // Store fetched events

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await fetchEvents();  // Fetch events from your database
        setEvents(fetchedEvents);
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
    });
    return () => unsubscribe();
  }, []);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    if (section !== 'host') {
      setIsDroppingPin(false);
    }
  };

  const viewEvent = (eventId: string) => {
    setActiveSection('viewEvent');
    setSelectedEventId(eventId);  // Highlight the selected event on the map
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventLocation(latLng);  // Set the location where the pin is dropped
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventsList viewEvent={viewEvent} events={events} />;
      case 'friends':
        return <FriendsList />;
      case 'login':
        return <Login />;
      case 'notifications':
        return <Notifications />;
      case 'signup':
        return <Signup />;
      case 'host':
        return <HostEvent setIsDroppingPin={setIsDroppingPin} eventLocation={eventLocation} />;
      case 'viewEvent':
        return selectedEventId ? <ViewEvent eventId={selectedEventId} /> : null;
      case 'logout':
        logOut();
        return null;
      default:
        return <EventsList viewEvent={viewEvent} events={events} />;
    }
  };

  return (
      <Container maxWidth="xl">
        <NavBar onNavClick={handleNavClick} isAuthenticated={isAuthenticated} />
        <Grid container spacing={2}>
          {/* Left Side: Dynamic UI */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'grey.100', height: { xs: '50vh', md: '100vh' }, overflowY: 'auto' }}>
              {renderActiveSection()}
            </Box>
          </Grid>

          {/* Right Side: Map */}
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 2, height: { xs: '50vh', md: '100vh' } }}>
              <Map
                  events={events}
                  selectedEventId={selectedEventId}  // Highlight selected event on the map
                  isDroppingPin={isDroppingPin}
                  onMapClick={handleMapClick}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
  );
}

export default App;
