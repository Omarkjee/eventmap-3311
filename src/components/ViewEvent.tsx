import React, { useState, useEffect } from 'react';
import { fetchEventById } from '../utils/firebaseEvents'; // Assuming you have this function to fetch one event

const ViewEvent = ({ eventId }) => {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEventById(eventId); // Fetch event details from Firestore
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    loadEvent();
  }, [eventId]);

  if (!event) return <div>Loading event details...</div>;

  return (
    <div className="view-event">
      <h2>{event.title}</h2>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Location Info:</strong> {event.location_info}</p>
      <p><strong>Start Time:</strong> {new Date(event.start_time).toLocaleString()}</p>
      <p><strong>End Time:</strong> {new Date(event.end_time).toLocaleString()}</p>
      <p><strong>Host ID:</strong> {event.host_id}</p>

      {/* Show additional info, such as contact details, RSVP list, etc. */}
      {event.is_private && (
        <p><strong>Invitees:</strong> {event.invite_emails.join(', ')}</p>
      )}
    </div>
  );
};

export default ViewEvent;
