import './Notifications.css';
import { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Button, Link } from '@mui/material';
import { EventDetails } from '../utils/firebaseEvents';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { fetchUserRSVPs } from '../utils/firebaseAuth';  // Assuming the function is correctly exported
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation

const Notifications = () => {
    const [createdEvents, setCreatedEvents] = useState<EventDetails[]>([]);
    const [rsvpEvents, setRsvpEvents] = useState<EventDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);  // Loading state to handle async fetching
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();  // Hook for navigating to event details

    useEffect(() => {
        const fetchUserEvents = async () => {
            const user = auth.currentUser;
            if (user) {
                setLoading(true);  // Start loading

                // Fetch created events (hosted by the user)
                const eventsRef = collection(db, 'events');
                const q = query(eventsRef, where('host_id', '==', user.uid));
                const createdEventsSnapshot = await getDocs(q);
                const createdEventsData = createdEventsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as EventDetails[];

                setCreatedEvents(createdEventsData);

                // Fetch RSVP'd events (using the RSVP_events array in the user's profile)
                const rsvpEventsIds = await fetchUserRSVPs(user.uid);
                if (rsvpEventsIds.length > 0) {
                    const rsvpQuery = query(eventsRef, where('id', 'in', rsvpEventsIds));
                    const rsvpEventsSnapshot = await getDocs(rsvpQuery);
                    const rsvpEventsData = rsvpEventsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as EventDetails[];
                    setRsvpEvents(rsvpEventsData);
                }

                setLoading(false);  // Stop loading once data is fetched
            }
        };

        fetchUserEvents();
    }, [auth, db]);

    const handleEventClick = (eventId: string) => {
        // Navigate to the event details page
        navigate(`/events/${eventId}`);
    };

    const handleHostEventClick = () => {
        // Navigate to the host event page at "/host"
        navigate('/host');
    };

    return (
        <div className="notifications">
            <Typography variant="h4" gutterBottom>
                My Events
            </Typography>

            {loading ? (
                <Typography>Loading...</Typography>  // Show loading text while fetching
            ) : (
                <>
                    {/* Display "Hosted Events" heading */}
                    <Typography variant="h5" gutterBottom>
                        Hosted Events
                    </Typography>
                    {createdEvents.length > 0 ? (
                        <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', p: 1 }}>
                            <List>
                                {createdEvents.map(event => (
                                    <ListItem key={event.id} sx={{ borderBottom: '1px solid #ddd' }}>
                                        <ListItemText
                                            primary={
                                                <Button onClick={() => handleEventClick(event.id)} sx={{ textTransform: 'none' }}>
                                                    {event.title}
                                                </Button>
                                            }
                                            secondary={`${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <>
                            <Typography>
                                No hosted events to display.{' '}
                                <Button onClick={handleHostEventClick} sx={{ textTransform: 'none', color: 'primary.main' }}>
                                  Create an Event?
                                </Button>
                            </Typography>
                        </>
                    )}

                    {/* Display "R.S.V.P.'s" heading */}
                    <Typography variant="h5" gutterBottom>
                        R.S.V.P.'s
                    </Typography>
                    {rsvpEvents.length > 0 ? (
                        <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', p: 1 }}>
                            <List>
                                {rsvpEvents.map(event => (
                                    <ListItem key={event.id} sx={{ borderBottom: '1px solid #ddd' }}>
                                        <ListItemText
                                            primary={
                                                <Button onClick={() => handleEventClick(event.id)} sx={{ textTransform: 'none' }}>
                                                    {event.title}
                                                </Button>
                                            }
                                            secondary={`${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <Typography>No RSVP'd events to display.</Typography>  // If no RSVP'd events
                    )}
                </>
            )}
        </div>
    );
};

export default Notifications;
