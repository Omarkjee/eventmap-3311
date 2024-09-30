import React, { useState } from 'react';
import { createEvent } from '../utils/firebaseEvents';

const HostEvent = () => {
  const [eventDetails, setEventDetails] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location_info: '',
    latitude: '',
    longitude: '',
    is_private: false,
    is_RSVPable: false,
    invite_emails: '',
    host_id: '', // Add the logged-in user's ID here
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(eventDetails);
      alert("Event created successfully!");
    } catch (error) {
      alert("Error creating event: " + error.message);
    }
  };

  return (
    <div className="host-event">
      {/* Render your form here */}
      <form onSubmit={handleSubmit}>
        {/* Add your input fields and update the eventDetails state as needed */}
      </form>
    </div>
  );
};

export default HostEvent;
