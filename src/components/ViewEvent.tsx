import { useState, useEffect } from 'react';
import { fetchEventById, deleteEvent } from '../utils/firebaseEvents';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Assuming react-router is used

interface EventDetails {
    id: string;
    title: string;
    description: string;
    location_info: string;
    start_time: Date | string;
    end_time: Date | string;
    host_id: string;
    is_private: boolean;
    invite_emails: string[];
}

interface ViewEventProps {
    eventId: string;  // Assume eventId is a string
    currentUserId: string | null; // To check if current user is the host
}

const ViewEvent = ({ eventId, currentUserId }: ViewEventProps) => {
    const [event, setEvent] = useState<EventDetails | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const eventData = await fetchEventById(eventId);
                setEvent(eventData);
            } catch (error) {
                console.error("Error fetching event:", error);
            }
        };

        loadEvent();
    }, [eventId]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteEvent(eventId);
                alert("Event deleted successfully!");
                navigate('/events'); // Redirect after deletion
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        }
    };

    if (!event) return <div>Loading event details...</div>;

    return (
        <Box sx={{ p: 2, maxWidth: '600px', margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                {event.title}
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>Description:</strong> {event.description}
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>Location Info:</strong> {event.location_info}
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>Start Time:</strong> {new Date(event.start_time).toLocaleString()}
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>End Time:</strong> {new Date(event.end_time).toLocaleString()}
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>Host ID:</strong> {event.host_id}
            </Typography>

            {event.is_private && (
                <Typography variant="body1" paragraph>
                    <strong>Invitees:</strong> {event.invite_emails.join(', ')}
                </Typography>
            )}

            {currentUserId && currentUserId === event.host_id && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => navigate(`/edit-event/${eventId}`)}>
                        Edit Event
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleDelete}>
                        Delete Event
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ViewEvent;
