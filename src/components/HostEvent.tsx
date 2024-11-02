import React, { useState, useEffect } from 'react';
import { TextField, Button, Switch, FormControlLabel, Typography, Box } from '@mui/material';
import { createEvent, editEvent, fetchEventById } from '../utils/firebaseEvents';
import { getAuth } from 'firebase/auth';

const HostEvent = ({ setIsDroppingPin, eventLocation, eventId }: { setIsDroppingPin: React.Dispatch<React.SetStateAction<boolean>>, eventLocation: { lat: number; lng: number }, eventId?: string }) => {
  const [eventDetails, setEventDetails] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location_info: '',
    latitude: 0,
    longitude: 0,
    is_private: false,
    is_RSVPable: false,
    invite_emails: '', // Changed to a string for form compatibility
    host_id: '', // Add the logged-in user's ID here later
  });

  useEffect(() => {
    if (eventId) {
      const loadEvent = async () => {
        const eventData = await fetchEventById(eventId);
        if (eventData) {
          setEventDetails({
            ...eventData,
            start_time: eventData.start_time.toString().slice(0, 16), // Format for input field
            end_time: eventData.end_time.toString().slice(0, 16), // Format for input field
            invite_emails: eventData.invite_emails.join(', ') // Convert array to comma-separated string for input field
          });
        }
      };
      loadEvent();
    }
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventDetails({
      ...eventDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleTogglePrivate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventDetails({
      ...eventDetails,
      is_private: e.target.checked
    });
  };

  const handleToggleRSVPable = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventDetails({
      ...eventDetails,
      is_RSVPable: e.target.checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user ID

    if (!userId) {
      alert("You must be logged in to create or edit an event.");
      return; // Prevent submission if not authenticated
    }

    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    if (new Date(eventDetails.start_time) > oneWeekFromNow) {
      alert("Events can only be created up to 1 week in advance.");
      return;
    }

    try {
      if (!eventDetails.title || !eventDetails.location_info || !eventLocation.lat || !eventLocation.lng) {
        alert("Please fill out all required fields and drop a pin on the map.");
        return;
      }

      const newEvent = {
        ...eventDetails,
        latitude: eventLocation.lat,
        longitude: eventLocation.lng,
        host_id: userId, // Set host_id to the authenticated user's ID
        invite_emails: eventDetails.invite_emails.split(',').map(email => email.trim()) // Convert string back to array
      };

      if (eventId) {
        await editEvent(eventId, newEvent);
        alert("Event updated successfully!");
      } else {
        await createEvent(newEvent);
        alert("Event created successfully!");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        alert("An error occurred while creating or editing the event. Please try again.");
      }
    }
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
              value={eventDetails.title}
              onChange={handleChange}
              required
              margin="normal"
          />

          <TextField
              fullWidth
              label="Location Info"
              name="location_info"
              value={eventDetails.location_info}
              onChange={handleChange}
              required
              margin="normal"
          />

          <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              name="start_time"
              value={eventDetails.start_time}
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
              value={eventDetails.end_time}
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
              value={eventDetails.description}
              onChange={handleChange}
              required
              margin="normal"
          />

          <FormControlLabel
              control={<Switch checked={eventDetails.is_private} onChange={handleTogglePrivate} />}
              label="Make event private"
          />

          {eventDetails.is_private && (
              <TextField
                  fullWidth
                  label="Invite people via email (comma separated)"
                  name="invite_emails"
                  value={eventDetails.invite_emails}
                  onChange={handleChange}
                  margin="normal"
              />
          )}

          <FormControlLabel
              control={<Switch checked={eventDetails.is_RSVPable} onChange={handleToggleRSVPable} />}
              label="Allow RSVPs"
          />

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
      </Box>
  );
};

export default HostEvent;
