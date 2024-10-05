import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../utils/firebaseEvents'; // Assuming you have this function in firebaseEvents

const EventsList = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await fetchEvents(); // Fetch all events from Firestore

        // Get current date and time
        const now = new Date();

        // Separate current and upcoming events
        const current = events.filter(event => new Date(event.start_time) <= now && new Date(event.end_time) >= now);
        const upcoming = events.filter(event => new Date(event.start_time) > now);

        setCurrentEvents(current);
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="events-list">
      <h2>Current Events</h2>
      <ul>
        {currentEvents.map(event => (
          <li key={event.id}>
            <button onClick={() => viewEvent(event.id)}>{event.title}</button>
            <p>{new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}</p>
          </li>
        ))}
      </ul>

      <h2>Upcoming Events</h2>
      <ul>
        {upcomingEvents.map(event => (
          <li key={event.id}>
            <button onClick={() => viewEvent(event.id)}>{event.title}</button>
            <p>{new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Placeholder function to handle viewing events
const viewEvent = (eventId: string) => {
  console.log(`View event with ID: ${eventId}`);
  // Navigate to the view event UI, or pass the eventId to show event details
};

export default EventsList;
