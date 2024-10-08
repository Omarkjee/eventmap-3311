import { useState, useEffect } from 'react';
import Banner from './components/Banner';
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

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventLocation(latLng);
  };

  return (
      <div className="flex flex-col h-screen">  {/* Apply Tailwind flexbox and full-screen height */}
        <Banner />
        <NavBar onNavClick={handleNavClick} isAuthenticated={isAuthenticated} />
        <div className="flex flex-grow">  {/* Flexbox for main content */}
          <div className="w-full md:w-1/3 p-4">  {/* Full width on mobile, 1/3 width on larger screens */}
            {renderActiveSection()}
          </div>
          <div className="w-full md:w-2/3 h-full">  {/* Full width on mobile, 2/3 width on larger screens */}
            <Map
                isDroppingPin={isDroppingPin}
                onMapClick={handleMapClick}
            />
          </div>
        </div>
      </div>
  );
}

export default App;
