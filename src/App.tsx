import React, { useState, useEffect } from 'react';
import './App.css';
import Banner from './components/Banner';
import NavBar from './components/NavBar';
import Map from './components/Map';  // The map is always shown here
import EventsList from './components/EventsList';
import FriendsList from './components/FriendsList'; 
import Login from './components/Login';
import Notifications from './components/Notifications';
import Signup from './components/Signup';
import HostEvent from './components/HostEvent';  // HostEvent does not include the map
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth
import { logOut } from './utils/firebaseAuth';

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);  // Lift state to App
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 }); // Stores event lat/lng

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
      setIsDroppingPin(false);  // Disable pin-dropping when leaving the HostEvent UI
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventsList />;
      case 'friends':
        return <FriendsList />;
      case 'login':
        return <Login />;
      case 'notifications':
        return <Notifications />;
      case 'signup':
        return <Signup />;
      case 'host':
        return <HostEvent 
                 setIsDroppingPin={setIsDroppingPin} 
                 eventLocation={eventLocation} 
               />;  // Pass props to HostEvent
      case 'logout':
        logOut();
        return null;
      default:
        return <EventsList />;
    }
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventLocation(latLng);  // Update event location when pin is dropped
    console.log("Pin dropped at:", latLng);
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
