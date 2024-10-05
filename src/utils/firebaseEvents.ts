import { getFirestore, collection, addDoc, doc, updateDoc, getDocs, Timestamp } from 'firebase/firestore';

const db = getFirestore();

type EventDetails = {
  title: string;
  description: string;
  start_time: Date | string;
  end_time: Date | string;
  location_info: string;
  latitude: number;
  longitude: number;
  is_private: boolean;
  is_RSVPable: boolean;
  invite_emails: string[];
  host_id: string;
};

export const createEvent = async (eventDetails: EventDetails): Promise<string> => {
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
  } catch (error: any) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const editEvent = async (eventId: string, updatedDetails: Partial<EventDetails>): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...updatedDetails,
      updated_at: Timestamp.now(),
    });
    console.log("Event updated:", eventId);
  } catch (error: any) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const fetchEvents = async (): Promise<EventDetails[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    let events: EventDetails[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as EventDetails);
    });
    return events;
  } catch (error: any) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const handleRSVP = async (eventId: string, userId: string): Promise<void> => {
  try {
    const rsvpRef = await addDoc(collection(db, 'rsvps'), {
      event_id: eventId,
      user_id: userId,
      rsvp_at: new Date().toISOString(),
    });
    console.log("RSVP submitted:", rsvpRef.id);
  } catch (error: any) {
    console.error("Error submitting RSVP:", error);
    throw error;
  }
};

export const inviteUsers = async (eventId: string, inviteEmails: string[]): Promise<void> => {
  try {
    inviteEmails.forEach(email => {
      console.log(`Sent invite to ${email} for event ID: ${eventId}`);
    });
  } catch (error: any) {
    console.error("Error sending invitations:", error);
    throw error;
  }
};
