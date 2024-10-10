import { useState, useEffect } from 'react';
import { Container, Grid, Box } from '@mui/material';  // Import MUI components
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

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });

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
    setSelectedEventId(eventId);
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventLocation(latLng);  // Set the location where the pin is dropped
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventsList viewEvent={viewEvent} />;
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
        return <EventsList viewEvent={viewEvent} />;
    }
  };

  return (
      <Container maxWidth="xl">  {/* Container for overall layout */}
        <NavBar onNavClick={handleNavClick} isAuthenticated={isAuthenticated} />
        <Grid container spacing={2}>  {/* Grid layout to replace flex */}
          {/* Left side: Dynamic UI */}
          <Grid item xs={12} md={4}>  {/* Full width on mobile, 4/12 on medium screens */}
            <Box sx={{ p: 2, bgcolor: 'grey.100', height: '100vh', overflowY: 'auto' }}>
              {renderActiveSection()}
            </Box>
          </Grid>

          {/* Right side: Map */}
          <Grid item xs={12} md={8}>  {/* Full width on mobile, 8/12 on medium screens */}
            <Box sx={{ p: 2, height: '100vh' }}>
              <Map isDroppingPin={isDroppingPin} onMapClick={handleMapClick} />
            </Box>
          </Grid>
        </Grid>
      </Container>
  );
}

export default App;
