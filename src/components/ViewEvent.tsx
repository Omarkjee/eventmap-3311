import { useState, useEffect } from 'react';
import { fetchEventById, deleteEvent } from '../utils/firebaseEvents';
import { addUserRSVP, removeUserRSVP, fetchUserRSVPs } from '../utils/firebaseAuth'; // Import the removeUserRSVP function
import { Button, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

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
    host_email: string;
    RSVP_events: string[]; // List of event IDs that the user has RSVP'd to
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
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const navigate = useNavigate();
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;
    const [userRSVPs, setUserRSVPs] = useState<string[]>([]);

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

    useEffect(() => {
        const loadUserRSVPs = async () => {
            if (currentUserId) {
                try {
                    const userRSVPList = await fetchUserRSVPs(currentUserId);
                    setUserRSVPs(userRSVPList);
                } catch (error) {
                    console.error("Error fetching user RSVPs:", error);
                }
            }
        };

        loadUserRSVPs();
    }, [currentUserId]);

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
        const eventUrl = `${window.location.origin}/events/${eventId}`;
        navigator.clipboard.writeText(eventUrl)
            .then(() => {
                setSnackbarOpen(true);
                setSnackbarMessage("Event link copied to clipboard!");
                setSnackbarSeverity("success");
            })
            .catch((error) => {
                setSnackbarOpen(true);
                setSnackbarMessage("Failed to copy link.");
                setSnackbarSeverity("error");
            });
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
                `You can view more details here: ${window.location.origin}/events/${eventId}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleEditEvent = () => {
        if (navigateToEditEvent) {
            navigateToEditEvent(eventId);
        } else {
            console.error("navigateToEditEvent function is undefined.");
        }
    };

    const handleRSVP = async () => {
        if (!currentUserId) {
            setSnackbarOpen(true);
            setSnackbarMessage("You must be logged in to Bookmark.");
            setSnackbarSeverity("error");
            return;
        }

        try {
            if (event) {
                if (userRSVPs.includes(eventId)) {
                    // Remove RSVP
                    await removeUserRSVP(currentUserId, eventId);
                    setSnackbarOpen(true);
                    setSnackbarMessage("Bookmark removed from event.");
                    setSnackbarSeverity("success");
                } else {
                    // Add RSVP
                    await addUserRSVP(currentUserId, eventId);
                    setSnackbarOpen(true);
                    setSnackbarMessage("Successfully Bookmarked the event!");
                    setSnackbarSeverity("success");
                }
                // Re-fetch user's RSVPs to reflect changes
                const updatedRSVPs = await fetchUserRSVPs(currentUserId);
                setUserRSVPs(updatedRSVPs);
            }
        } catch (error) {
            console.error("Error Bookmarking the event:", error);
            setSnackbarOpen(true);
            setSnackbarMessage("Failed to update Bookmark. Please try again.");
            setSnackbarSeverity("error");
        }
    };

    if (!event) return <div>Loading event details...</div>;

    const hostEmail = event.host_email;
    const host = hostEmail && hostEmail.includes('@') ? hostEmail.split('@')[0] : 'Unavailable';
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

            <Typography variant="body1" paragraph>
                <strong>Host:</strong>{' '}
                {currentUserId ? (
                    `${host} (${hostEmail})`
                ) : (
                    <em>Login to see the host details</em>
                )}
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

                {/* Disable RSVP button for the host */}
                <Button 
                    variant="outlined" 
                    onClick={handleRSVP} 
                    disabled={isHost}
                >
                    {isHost ? 'You are the Host (Cannot Bookmark)' : (userRSVPs.includes(eventId) ? 'Remove Bookmark' : 'Bookmark Event')}
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
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ViewEvent;
