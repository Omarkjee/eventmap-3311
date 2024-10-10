import React, { useState } from 'react';
import { TextField, Button, Switch, FormControlLabel, Typography, Box } from '@mui/material';
import { createEvent } from '../utils/firebaseEvents';

const HostEvent = ({ setIsDroppingPin, eventLocation }: { setIsDroppingPin: React.Dispatch<React.SetStateAction<boolean>>, eventLocation: { lat: number; lng: number } }) => {
  const [eventDetails, setEventDetails] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location_info: '',
    latitude: 0,
    longitude: 0,
    is_private: false,
    is_RSVPable: false,  // Add this field
    invite_emails: '',
    host_id: '', // Add the logged-in user's ID here later
  });

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
      is_RSVPable: e.target.checked   // Handle RSVP toggle
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!eventDetails.title || !eventDetails.location_info || !eventLocation.lat || !eventLocation.lng) {
        alert("Please fill out all required fields and drop a pin on the map.");
        return;
      }

      const newEvent = {
        ...eventDetails,
        latitude: eventLocation.lat,
        longitude: eventLocation.lng,
      };

      await createEvent(newEvent);
      alert("Event created successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  return (
      <Box sx={{ p: 2, maxWidth: '600px', margin: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Host an Event
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
            Create Event
          </Button>
        </form>
      </Box>
  );
};

export default HostEvent;
