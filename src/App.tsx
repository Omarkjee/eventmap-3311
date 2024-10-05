import React, { useState, useEffect } from 'react';
import './App.css';
import Banner from './components/Banner';
import NavBar from './components/NavBar';
import Map from './components/Map';
import EventsList from './components/EventsList';
import FriendsList from './components/FriendsList'; 
import Login from './components/Login';
import Notifications from './components/Notifications';
import Signup from './components/Signup';
import HostEvent from './components/HostEvent'; // Import the HostEvent component
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth
import { logOut } from './utils/firebaseAuth';

function App() {
  const [activeSection, setActiveSection] = useState<string>('events');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in
        setIsAuthenticated(true);
      } else {
        // User is logged out
        setIsAuthenticated(false);
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
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
        return <HostEvent />;  
      case 'logout':
        logOut();
        return null;  // Optionally redirect somewhere or just return null
      default:
        return <EventsList />;
    }
  };

  return (
    <div className="App">
      <Banner />
      <NavBar onNavClick={handleNavClick} isAuthenticated={isAuthenticated} />
      <div className="main-content">
        <div className="left-panel">
          {renderActiveSection()}
        </div>
        <div className="map-container">
          <Map />
        </div>
      </div>
    </div>
  );
}

export default App;
