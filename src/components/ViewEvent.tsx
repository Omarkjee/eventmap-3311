import { useState, useEffect } from 'react';
import { fetchEventById, deleteEvent } from '../utils/firebaseEvents';
import { Button, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth'; // Import Firebase auth to get the current user


interface EventDetails {
    id: string;
    title: string;
    description: string;
    location_info: string;
    start_time: Date | string;
    end_time: Date | string;
    host_id: string; // This will be used to derive host_email
    is_private: boolean;
    invite_emails: string[];
    host_email: string; // Added host_email to the EventDetails interface
}

interface ViewEventProps {
    eventId: string;
    navigateToEditEvent: (eventId: string) => void;
    currentUserId: string | null;
    currentUserEmail: string | null;
}

const ViewEvent = ({ eventId, navigateToEditEvent }: ViewEventProps) => {
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth(); // Get the Firebase auth instance
    const currentUserId = auth.currentUser?.uid; // Get the current user's ID


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
                navigate('/events');
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        }
    };

    const handleCopyLink = () => {
        const eventUrl = `${window.location.origin}/events/${eventId}`; // Generate event URL
        navigator.clipboard.writeText(eventUrl)
            .then(() => {
                setSnackbarOpen(true);
                console.log("Event URL copied:", eventUrl); // Log the URL for verification
            })
            .catch((error) => console.error("Failed to copy link:", error));
    };

    const handleShareByEmail = () => {
        if (event) {
            const subject = `Check out this event: ${event.title}`;
            const body = `Here are the details for the event:\n\n` +
                `Title: ${event.title}\n` +
                `Description: ${event.description}\n` +
                `Location: ${event.location_info}\n` +
                `Start Time: ${new Date(event.start_time).toLocaleString()}\n` +
                `End Time: ${new Date(event.end_time).toLocaleString()}\n\n` +
                `You can view more details here: ${window.location.origin}/events/${eventId}`; // Ensure correct URL
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleEditEvent = () => {
        if (navigateToEditEvent) {
            navigateToEditEvent(eventId); // Call the prop function to navigate
        } else {
            console.error("navigateToEditEvent function is undefined.");
        }
    };

    if (!event) return <div>Loading event details...</div>;

    // Extract host from host_email and handle empty cases
    const hostEmail = event.host_email;
    const host = hostEmail && hostEmail.includes('@') ? hostEmail.split('@')[0] : 'Unavailable'; // Fallback if host_email is invalid

    // Check if the current user is the host
    const isHost = currentUserId === event.host_id;

    return (
        <Box sx={{
            p: 2,
            maxWidth: '600px',
            width: '100%',
            margin: 'auto',
            boxSizing: 'border-box',
            '@media (max-width: 600px)': {
                padding: '16px',
                maxWidth: '100%',
            },
        }}>
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

            {/* Display the host instead of host_email */}
            <Typography variant="body1" paragraph>
                <strong>Host:</strong> {host} {/* Display host without domain */}
            </Typography>

            {event.is_private && (
                <Typography variant="body1" paragraph>
                    <strong>Invitees:</strong> {event.invite_emails.join(', ')}
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={handleCopyLink}>
                    Copy Event Link
                </Button>
                <Button variant="outlined" onClick={handleShareByEmail}>
                    Share Event via Email
                </Button>

                {isHost && (
                    <>
                        <Button variant="outlined" onClick={handleEditEvent}>
                            Edit Event
                        </Button>
                        <Button variant="outlined" onClick={handleDelete}>
                            Delete Event
                        </Button>
                    </>
                )}

            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    Event link copied to clipboard!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ViewEvent;
