import  { useState } from 'react';
import './App.css';
import Banner from './components/Banner';
import NavBar from './components/NavBar';
import Map from './components/Map';
import EventsList from './components/EventsList';
import FriendsList from './components/Friends';
import Login from './components/Login';
import Notifications from './components/Notifications';


function App() {
  // State to track which section is active
  const [activeSection, setActiveSection] = useState('events');

  // Function to handle button clicks in the NavBar
  const handleNavClick = (section: string) => {
    setActiveSection(section);D
  };

  // Dynamic rendering based on active section
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
      default:
        return <EventsList />;
    }
  };

  return (
    <div className="App">
      <Banner />
      <NavBar onNavClick={handleNavClick} />
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
