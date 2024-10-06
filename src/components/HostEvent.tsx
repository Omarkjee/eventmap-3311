import React, { useState } from 'react';
import { createEvent } from '../utils/firebaseEvents';

const HostEvent = ({ setIsDroppingPin, eventLocation }: { setIsDroppingPin: React.Dispatch<React.SetStateAction<boolean>>,
    eventLocation: { lat: number; lng: number } }) => {
  const [eventDetails, setEventDetails] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location_info: '',
    latitude: 0,
    longitude: 0,
    is_private: false,
    is_RSVPable: false,
    invite_emails: [],
    host_id: '', // Add the logged-in user's ID here
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventDetails({
      ...eventDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!eventDetails.title || !eventDetails.location_info || !eventLocation.lat || !eventLocation.lng) {
        alert("Please fill out all required fields and drop a pin on the map.");
        return;
      }
  
      // Create a new event without passing `id`
      const newEvent = {
        ...eventDetails,
        latitude: eventLocation.lat,
        longitude: eventLocation.lng,
      };
  
      await createEvent(newEvent);  // Pass newEvent without id
      alert("Event created successfully!");
    } catch (error: any) {
      alert("Error creating event: " + error.message);
    }
  };

  return (
    <div className="host-event">
      <h2>Host an Event</h2>
      <form onSubmit={handleSubmit}>
        <label>Event Name</label>
        <input
          type="text"
          name="title"
          value={eventDetails.title}
          onChange={handleChange}
          required
        />

        <label>Location Info</label>
        <input
          type="text"
          name="location_info"
          value={eventDetails.location_info}
          onChange={handleChange}
          required
        />

        <label>Start Time</label>
        <input
          type="datetime-local"
          name="start_time"
          value={eventDetails.start_time}
          onChange={handleChange}
          required
        />

        <label>End Time</label>
        <input
          type="datetime-local"
          name="end_time"
          value={eventDetails.end_time}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={eventDetails.description}
          onChange={handleChange}
          required
        />

        {/* Button to enable pin-dropping mode */}
        <button type="button" onClick={() => setIsDroppingPin(true)}>
          Drop Pin on Map
        </button>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default HostEvent;
