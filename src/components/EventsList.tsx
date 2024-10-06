import { useState, useEffect } from 'react';
import { fetchEvents, EventDetails } from '../utils/firebaseEvents';  // Ensure EventDetails is imported

// Define the type for viewEvent function
interface EventsListProps {
  viewEvent: (eventId: string) => void;
}

const EventsList: React.FC<EventsListProps> = ({ viewEvent }) => {
  const [currentEvents, setCurrentEvents] = useState<EventDetails[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDetails[]>([]);

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
          event.id ? (
            <li key={event.id}>
              <button onClick={() => viewEvent(event.id)}>{event.title}</button>
              <p>{new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}</p>
            </li>
          ) : null
        ))}
      </ul>

      <h2>Upcoming Events</h2>
      <ul>
        {upcomingEvents.map(event => (
          event.id ? (
            <li key={event.id}>
              <button onClick={() => viewEvent(event.id)}>{event.title}</button>
              <p>{new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}</p>
            </li>
          ) : null
        ))}
      </ul>
    </div>
  );
};

export default EventsList;
