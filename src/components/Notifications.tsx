import './Notifications.css';
import { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Button, Modal } from '@mui/material';
import { EventDetails } from '../utils/firebaseEvents';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { fetchUserRSVPs, removeUserRSVP } from '../utils/firebaseAuth';  // Assuming the functions are correctly exported
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation

const Notifications = () => {
    const [createdEvents, setCreatedEvents] = useState<EventDetails[]>([]);
    const [rsvpEvents, setRsvpEvents] = useState<EventDetails[]>([]);
    const [originalRsvpCount, setOriginalRsvpCount] = useState<number>(0);  // Store the count of original RSVP events
    const [loading, setLoading] = useState<boolean>(true);  // Loading state to handle async fetching
    const [openModal, setOpenModal] = useState(false);  // State to control the Modal
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();  // Hook for navigating to event details

    useEffect(() => {
        const fetchUserEvents = async () => {
            const user = auth.currentUser;
            if (user) {
                setLoading(true);

                // Fetch created events
                const eventsRef = collection(db, 'events');
                const createdQuery = query(eventsRef, where('host_id', '==', user.uid));
                const createdEventsSnapshot = await getDocs(createdQuery);
                const createdEventsData = createdEventsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    start_time: doc.data().start_time?.toDate ? doc.data().start_time.toDate() : new Date(doc.data().start_time),
                    end_time: doc.data().end_time?.toDate ? doc.data().end_time.toDate() : new Date(doc.data().end_time),
                }));
                setCreatedEvents(createdEventsData);

                // Fetch RSVP'd events
                const rsvpEventsIds = await fetchUserRSVPs(user.uid);
                const chunkSize = 10;
                const rsvpEventsData: EventDetails[] = [];
                for (let i = 0; i < rsvpEventsIds.length; i += chunkSize) {
                    const chunk = rsvpEventsIds.slice(i, i + chunkSize);
                    const rsvpQuery = query(eventsRef, where('__name__', 'in', chunk));
                    const rsvpEventsSnapshot = await getDocs(rsvpQuery);
                    rsvpEventsSnapshot.docs.forEach(doc => {
                        rsvpEventsData.push({
                            id: doc.id,
                            ...doc.data(),
                            start_time: doc.data().start_time?.toDate ? doc.data().start_time.toDate() : new Date(doc.data().start_time),
                            end_time: doc.data().end_time?.toDate ? doc.data().end_time.toDate() : new Date(doc.data().end_time),
                        } as EventDetails);
                    });
                }
                setRsvpEvents(rsvpEventsData);
                setOriginalRsvpCount(rsvpEventsIds.length);

                setLoading(false);
            }
        };

        fetchUserEvents();
    }, [auth, db]);


    // Debugging rsvpEvents update and count
    useEffect(() => {
        console.log("RSVP Events Updated:", rsvpEvents); // This will log the rsvpEvents after it updates
        console.log("Original RSVP Count:", originalRsvpCount);  // Log original RSVP count
    }, [rsvpEvents, originalRsvpCount]);

    const handleEventClick = (eventId: string) => {
        // Navigate to the event details page
        navigate(`/events/${eventId}`);
    };

    const handleHostEventClick = () => {
        // Navigate to the host event page at "/host"
        navigate('/host');
    };

    const handleRemoveMissingEvents = async () => {
        const user = auth.currentUser;
        if (user) {
            // Remove missing events from the user's RSVP list in Firestore
            const rsvpEventsIds = await fetchUserRSVPs(user.uid);  // Fetch RSVP event IDs again to remove missing ones
            const missingEventIds = rsvpEventsIds.filter(eventId => eventId && !rsvpEvents.some(event => event.id === eventId));

            // Remove each missing event from the user's RSVP list
            for (const eventId of missingEventIds) {
                await removeUserRSVP(user.uid, eventId);  // Remove the event from Firestore
            }

            // Update state to reflect the removal of missing events
            const updatedRsvpEvents = rsvpEvents.filter(event => !missingEventIds.includes(event.id));
            setRsvpEvents(updatedRsvpEvents);  // Update the state with the valid RSVP events
            setOriginalRsvpCount(updatedRsvpEvents.length);  // Update the count based on the updated list

            // Close the modal after removing events
            setOpenModal(false);
            alert("Missing events removed from your RSVP list.");
        }
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
                        Bookmarked Events
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
                        <Typography>No Bookmarked events to display.</Typography>  // If no RSVP'd events
                    )}

                    {/* Display RSVP management button */}
                    {/*<Button*/}
                    {/*    onClick={() => setOpenModal(true)}*/}
                    {/*    variant="outlined"*/}
                    {/*    color="primary"*/}
                    {/*    sx={{ marginTop: '20px' }}*/}
                    {/*>*/}
                    {/*    Manage Your RSVPs ({originalRsvpCount})  /!* Show the original RSVP count *!/*/}
                    {/*</Button>*/}
                </>
            )}

            {/* Modal to manage missing RSVP events */}
            {/*<Modal*/}
            {/*    open={openModal}*/}
            {/*    onClose={() => setOpenModal(false)}*/}
            {/*    aria-labelledby="modal-title"*/}
            {/*    aria-describedby="modal-description"*/}
            {/*>*/}
            {/*    <Box sx={{*/}
            {/*        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',*/}
            {/*        backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '100%'*/}
            {/*    }}>*/}
            {/*        <Typography id="modal-title" variant="h6" gutterBottom>*/}
            {/*            Missing Events*/}
            {/*        </Typography>*/}
            {/*        {missingEventsCount > 0 ? (*/}
            {/*            <Typography id="modal-description" variant="body1" gutterBottom>*/}
            {/*                You have {missingEventsCount} event(s) in your RSVP list that no longer exist. Would you like to remove them?*/}
            {/*            </Typography>*/}
            {/*        ) : (*/}
            {/*            <Typography id="modal-description" variant="body1" gutterBottom>*/}
            {/*                There are no missing events in your RSVP list.*/}
            {/*            </Typography>*/}
            {/*        )}*/}

            {/*        {missingEventsCount > 0 && (*/}
            {/*            <Button*/}
            {/*                variant="contained"*/}
            {/*                color="secondary"*/}
            {/*                onClick={handleRemoveMissingEvents}*/}
            {/*                sx={{ marginTop: '10px' }}*/}
            {/*            >*/}
            {/*                Remove Missing Events*/}
            {/*            </Button>*/}
            {/*        )}*/}

            {/*        <Button*/}
            {/*            variant="outlined"*/}
            {/*            onClick={() => setOpenModal(false)}*/}
            {/*            sx={{ marginTop: '10px', marginLeft: '10px' }}*/}
            {/*        >*/}
            {/*            Close*/}
            {/*        </Button>*/}
            {/*    </Box>*/}
            {/*</Modal>*/}
        </div>
    );
};

export default Notifications;
