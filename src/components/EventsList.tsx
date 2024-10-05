import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../utils/firebaseEvents';

const EventsList = ({ viewEvent }) => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await fetchEvents();

        const now = new Date();

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

export default EventsList;
