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
        <div className="bg-gray-50 p-6 rounded-md shadow-md">  {/* Updated with Tailwind classes */}
            <h2 className="text-2xl font-semibold mb-4">Current Events</h2>
            <ul className="space-y-4">  {/* Adds vertical spacing between event items */}
                {currentEvents.map(event => (
                    event.id ? (
                        <li key={event.id} className="border p-4 rounded-md hover:bg-gray-100 cursor-pointer"> {/* Adds hover and padding */}
                            <button onClick={() => viewEvent(event.id)} className="text-lg font-medium text-blue-600 hover:underline">
                                {event.title}
                            </button>
                            <p className="text-sm text-gray-600">
                                {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                            </p>
                        </li>
                    ) : null
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">Upcoming Events</h2>
            <ul className="space-y-4">  {/* Adds vertical spacing between upcoming event items */}
                {upcomingEvents.map(event => (
                    event.id ? (
                        <li key={event.id} className="border p-4 rounded-md hover:bg-gray-100 cursor-pointer">
                            <button onClick={() => viewEvent(event.id)} className="text-lg font-medium text-blue-600 hover:underline">
                                {event.title}
                            </button>
                            <p className="text-sm text-gray-600">
                                {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                            </p>
                        </li>
                    ) : null
                ))}
            </ul>
        </div>
    );
};

export default EventsList;
