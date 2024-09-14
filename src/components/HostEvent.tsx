import React from 'react';
import './HostEvent.css';

const HostEvent = () => {
  return (
    <div className="host-event">
      <h2>Host a New Event</h2>
      <form>
        <label>Event Name</label>
        <input type="text" placeholder="Event Name" />

        <label>Event Date</label>
        <input type="date" />

        <label>Event Description</label>
        <textarea placeholder="Describe the event..."></textarea>

        <button type="submit">Host Event</button>
      </form>
    </div>
  );
};

export default HostEvent;
