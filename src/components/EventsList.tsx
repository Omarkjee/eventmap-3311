import React, { useState, useEffect } from 'react';
import { fetchEvents, EventDetails } from '../utils/firebaseEvents';
import { Box, Typography, List, ListItem, ListItemText, Button, useMediaQuery, useTheme, Tabs, Tab } from '@mui/material';

interface EventsListProps {
    viewEvent: (eventId: string) => void;
}

const EventsList: React.FC<EventsListProps> = ({ viewEvent }) => {
    const [currentEvents, setCurrentEvents] = useState<EventDetails[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<EventDetails[]>([]);
    const [activeTab, setActiveTab] = useState(0); // New state for controlling tabs

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjust layout for mobile

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

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const renderEventList = (events: EventDetails[]) => (
        <Box
            sx={{
                maxHeight: isMobile ? '150px' : '300px', // Dynamic height
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '8px',
                p: 1,
            }}
        >
            <List>
                {events.map((event) => (
                    <ListItem key={event.id} sx={{ borderBottom: '1px solid #ddd' }}>
                        <ListItemText
                            primary={
                                <Button onClick={() => viewEvent(event.id)} sx={{ textTransform: 'none' }}>
                                    {event.title}
                                </Button>
                            }
                            secondary={`${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box p={2} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {isMobile ? (
                <>
                    {/* Tabs for mobile view */}
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                        <Tab label="Current" />
                        <Tab label="Upcoming" />
                    </Tabs>

                    {/* Render the active tab content */}
                    {activeTab === 0 && (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Current Events
                            </Typography>
                            {renderEventList(currentEvents)}
                        </>
                    )}
                    {activeTab === 1 && (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Upcoming Events
                            </Typography>
                            {renderEventList(upcomingEvents)}
                        </>
                    )}
                </>
            ) : (
                <>
                    {/* Standard layout for larger screens */}
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Current Events
                        </Typography>
                        {renderEventList(currentEvents)}
                    </Box>

                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Upcoming Events
                        </Typography>
                        {renderEventList(upcomingEvents)}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default EventsList;
