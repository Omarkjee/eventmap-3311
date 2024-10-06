import  { useState, useEffect } from 'react';
import './App.css';
import Banner from './components/Banner';
import NavBar from './components/NavBar';
import Map from './components/Map';
import EventsList from './components/EventsList';
import FriendsList from './components/FriendsList'; 
import Login from './components/Login';
import Notifications from './components/Notifications';
import Signup from './components/Signup';
import HostEvent from './components/HostEvent';
import ViewEvent from './components/ViewEvent';  // Import ViewEvent component
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth
import { logOut } from './utils/firebaseAuth';

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);  // Track selected event ID
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    if (section !== 'host') {
      setIsDroppingPin(false);  // Disable pin-dropping if not in HostEvent UI
    }
  };

  // Function to handle switching to View Event UI
  const viewEvent = (eventId: string) => {
    setActiveSection('viewEvent');  // Switch to the view event section
    setSelectedEventId(eventId);    // Pass the selected event ID to the ViewEvent component
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventsList viewEvent={viewEvent} />;  // Pass viewEvent to EventsList
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
        return selectedEventId ? <ViewEvent eventId={selectedEventId} /> : null;  // Show ViewEvent when event ID is set
      case 'logout':
        logOut();
        return null;
      default:
        return <EventsList viewEvent={viewEvent} />;  // Pass viewEvent to EventsList
    }
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventLocation(latLng);  // Update event location when pin is dropped
  };

  return (
    <div className="App">
      <Banner />
      <NavBar onNavClick={handleNavClick} isAuthenticated={isAuthenticated} />
      <div className="main-content">
        <div className="left-panel">
          {renderActiveSection()}  {/* Dynamic content changes here */}
        </div>
        <div className="map-container">
          <Map 
            isDroppingPin={isDroppingPin} 
            onMapClick={handleMapClick}  // Pass function to handle map clicks
          />
        </div>
      </div>
    </div>
  );
}

export default App;
