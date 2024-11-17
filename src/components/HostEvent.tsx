import React, { useState, useEffect } from 'react';
import { TextField, Button, Switch, FormControlLabel, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { createEvent, editEvent } from '../utils/firebaseEvents';
import { getAuth } from 'firebase/auth';
import { Filter } from 'bad-words';

interface EventDetails {
  title: string;
  description: string;
  start_time: Date | string;
  end_time: Date | string;
  location_info: string;
  latitude: number;
  longitude: number;
  is_private: boolean;
  is_RSVPable: boolean;
  invite_emails: string[]; // Updated to string[]
  host_id: string;
}

const HostEvent = ({
  setIsDroppingPin,
  eventLocation,
  setEventLocation,
  eventId,
  eventDetails,
  refreshEvents,
  setActiveSection,
  setSelectedEventId,
  clearDroppedPin
  }: {
  setIsDroppingPin: React.Dispatch<React.SetStateAction<boolean>>,
  eventLocation: { lat: number; lng: number },
  setEventLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
  eventId?: string | null,
  eventDetails?: EventDetails,
  refreshEvents: () => void,
  setActiveSection: (sectionId: string) => void,
  setSelectedEventId: React.Dispatch<React.SetStateAction<string | null>>,
  clearDroppedPin: () => void
}) => {
  const [eventDetailsState, setEventDetailsState] = useState<EventDetails>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location_info: '',
    latitude: 0,
    longitude: 0,
    is_private: false,
    is_RSVPable: false,
    invite_emails: [], // Set as an empty array initially
    host_id: ''
  });

  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const filter = new Filter();

  useEffect(() => {
    if (eventDetails) {
      // Hardcode a -6 hour offset for display
      const localStartTime = new Date(eventDetails.start_time);
      localStartTime.setHours(localStartTime.getHours() - 6);

      const localEndTime = new Date(eventDetails.end_time);
      localEndTime.setHours(localEndTime.getHours() - 6);

      setEventDetailsState({
        ...eventDetails,
        start_time: localStartTime.toISOString().slice(0, 16), // Format for datetime-local input
        end_time: localEndTime.toISOString().slice(0, 16),
        invite_emails: eventDetails.invite_emails,
      });

      if (eventDetails.latitude && eventDetails.longitude) {
        setEventLocation({ lat: eventDetails.latitude, lng: eventDetails.longitude });
      }
    } else {
      // Clear form for new event creation
      setEventDetailsState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location_info: '',
        latitude: 0,
        longitude: 0,
        is_private: false,
        is_RSVPable: false,
        invite_emails: [],
        host_id: ''
      });
    }
  }, [eventDetails]);






  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Check for inappropriate language
    if (filter.isProfane(value)) {
      setWarningMessage("Your input contains inappropriate language. Please re-enter.");
      setEventDetailsState({
        ...eventDetailsState,
        [e.target.name]: ''
      });
      return;
    }

    setEventDetailsState({
      ...eventDetailsState,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    if (!userId) {
      alert("You must be logged in to create or edit an event.");
      return;
    }

    const newEvent = {
      ...eventDetailsState,
      latitude: eventLocation.lat,
      longitude: eventLocation.lng,
      host_id: userId
    };

    try {
      if (eventId) {
        await editEvent(eventId, newEvent);
        alert("Event updated successfully!");
      } else {
        await createEvent(newEvent);
        alert("Event created successfully!");
      }
      refreshEvents();

      setSelectedEventId(null); // Deselect any event
      setEventLocation({ lat: 0, lng: 0 }); // Reset the location
      setIsDroppingPin(false);
      clearDroppedPin();
      setActiveSection("events"); // Navigate back to the events list view


    } catch (error) {
      console.error("Error creating/editing event:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    setWarningMessage(null);
  };

  return (
      <Box sx={{ p: 2, maxWidth: '600px', margin: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          {eventId ? "Edit Event" : "Host an Event"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
              fullWidth
              label="Event Name"
              name="title"
              value={eventDetailsState.title}
              onChange={handleChange}
              required
              margin="normal"
          />
          <TextField
              fullWidth
              label="Location Info"
              name="location_info"
              value={eventDetailsState.location_info}
              onChange={handleChange}
              required
              margin="normal"
          />
          <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              name="start_time"
              value={eventDetailsState.start_time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              margin="normal"
          />
          <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              name="end_time"
              value={eventDetailsState.end_time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              margin="normal"
          />
          <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={eventDetailsState.description}
              onChange={handleChange}
              required
              margin="normal"
          />
          {eventDetailsState.is_private && (
              <TextField
                  fullWidth
                  label="Invite people via email (comma separated)"
                  name="invite_emails"
                  value={eventDetailsState.invite_emails.join(', ')} // Convert to string for display
                  onChange={(e) =>
                      setEventDetailsState({
                        ...eventDetailsState,
                        invite_emails: e.target.value.split(',').map(email => email.trim()) // Convert back to array on change
                      })
                  }
                  margin="normal"
              />
          )}
          <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => setIsDroppingPin(true)}
          >
            Drop Pin on Map
          </Button>
          <Button
              fullWidth
              variant="contained"
              color="secondary"
              type="submit"
              sx={{ mt: 2 }}
          >
            {eventId ? "Update Event" : "Create Event"}
          </Button>
        </form>
        <Dialog open={Boolean(warningMessage)} onClose={handleCloseDialog}>
          <DialogTitle>Warning</DialogTitle>
          <DialogContent>
            <Typography>{warningMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default HostEvent;
