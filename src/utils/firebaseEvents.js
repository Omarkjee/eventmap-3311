import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const db = getFirestore();

export const createEvent = async (eventDetails) => {
  try {
    const eventRef = await addDoc(collection(db, 'events'), {
      title: eventDetails.title,
      description: eventDetails.description,
      start_time: Timestamp.fromDate(new Date(eventDetails.start_time)),
      end_time: Timestamp.fromDate(new Date(eventDetails.end_time)),
      location_info: eventDetails.location_info,
      latitude: eventDetails.latitude,
      longitude: eventDetails.longitude,
      is_private: eventDetails.is_private,
      is_RSVPable: eventDetails.is_RSVPable,
      invite_emails: eventDetails.is_private ? eventDetails.invite_emails : [],
      host_id: eventDetails.host_id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    console.log("Event created with ID:", eventRef.id);
    return eventRef.id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const editEvent = async (eventId, updatedDetails) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        ...updatedDetails,
        updated_at: Timestamp.now(),
      });
      console.log("Event updated:", eventId);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  export const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      let events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  export const handleRSVP = async (eventId, userId) => {
    try {
      const rsvpRef = await addDoc(collection(db, 'rsvps'), {
        event_id: eventId,
        user_id: userId,
        rsvp_at: new Date().toISOString(),
      });
      console.log("RSVP submitted:", rsvpRef.id);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      throw error;
    }
  };

  export const inviteUsers = async (eventId, inviteEmails) => {
    try {
      // You would integrate with an email sending service here, like SendGrid or Firebase Cloud Functions.
      // This is a placeholder for sending the emails.
      inviteEmails.forEach(email => {
        console.log(`Sent invite to ${email} for event ID: ${eventId}`);
      });
    } catch (error) {
      console.error("Error sending invitations:", error);
      throw error;
    }
  };