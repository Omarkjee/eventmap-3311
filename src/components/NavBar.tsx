import React from 'react';
import './NavBar.css';

interface NavBarProps {
  onNavClick: (section: string) => void;
  isAuthenticated: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ onNavClick, isAuthenticated }) => {
  return (
    <nav className="navbar">
      <button onClick={() => onNavClick('events')}>Events</button>
      <button onClick={() => onNavClick('host')}>Host Event</button>
      <button onClick={() => onNavClick('friends')}>Friends</button>
      <button onClick={() => onNavClick('notifications')}>Notifications</button>

      {/* Conditionally render Login/Logout button */}
      {isAuthenticated ? (
        <button onClick={() => onNavClick('logout')}>Logout</button>
      ) : (
        <>
          <button onClick={() => onNavClick('login')}>Login</button>
          {/* Show Sign Up only when not authenticated */}
          <button onClick={() => onNavClick('signup')}>Sign Up</button>
        </>
      )}
    </nav>
  );
};

export default NavBar;
