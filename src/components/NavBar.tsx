import React from 'react';
import './NavBar.css';

const NavBar = ({ onNavClick }: { onNavClick: (section: string) => void }) => {
  return (
    <nav className="navbar">
      <button onClick={() => onNavClick('events')}>Events</button>
      <button onClick={() => onNavClick('host')}>Host Event</button>
      <button onClick={() => onNavClick('friends')}>Friends</button>
      <button onClick={() => onNavClick('notifications')}>Notifications</button>
      <button onClick={() => onNavClick('login')}>Login</button>
      <button onClick={() => onNavClick('signup')}>Sign Up</button>
    </nav>
  );
};

export default NavBar;
