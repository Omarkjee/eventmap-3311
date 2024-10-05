import React, { useState } from 'react';
import { createEvent } from '../utils/firebaseEvents';
import Map from './Map';

const HostEvent = () => {
  // Local state for the form inputs (this state is not sent to the database until the form is submitted)
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

  const [isDroppingPin, setIsDroppingPin] = useState(false); // State to track if pin-dropping is active

  // Updates the local state whenever the user types something in the input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventDetails({
      ...eventDetails,
      [e.target.name]: e.target.value
    });
  };

  // Function to handle map click and save lat/lng
  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    setEventDetails({
      ...eventDetails,
      latitude: latLng.lat,
      longitude: latLng.lng
    });
    // No need to disable pin-dropping here; the user can move the pin around freely
  };

  // Only triggered when the "Create Event" button is clicked
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Perform field validation here if needed
      if (!eventDetails.title || !eventDetails.location_info) {
        alert("Please fill out all required fields");
        return;
      }

      // Call the createEvent function to save the event in the database
      await createEvent(eventDetails);
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
      {/* Pass the isDroppingPin state to enable or disable pin dropping */}
      <Map onMapClick={handleMapClick} isDroppingPin={isDroppingPin} />
    </div>
  );
};

export default HostEvent;
