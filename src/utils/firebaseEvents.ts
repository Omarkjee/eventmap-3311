import { app } from './firebaseConfig';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, Timestamp } from 'firebase/firestore';

const db = getFirestore(app);

export type EventDetails = {
  id: string;
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

// Create Event
export const createEvent = async (eventDetails: {
    is_private: boolean;
    start_time: string;
    is_RSVPable: boolean;
    invite_emails: string;
    latitude: number;
    end_time: string;
    description: string;
    title: string;
    location_info: string;
    host_id: string;
    longitude: number
}): Promise<string> => {
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
// Fetch All Events
export const fetchEvents = async (): Promise<EventDetails[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    let events: EventDetails[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: EventDetails = {
        id: doc.id,
        title: data.title ?? '',
        description: data.description ?? '',
        start_time: data.start_time?.toDate() ?? '',  // Optional chaining with Timestamp conversion
        end_time: data.end_time?.toDate() ?? '',
        location_info: data.location_info ?? '',
        latitude: data.latitude ?? 0,  // Use default values
        longitude: data.longitude ?? 0,
        is_private: data.is_private ?? false,
        is_RSVPable: data.is_RSVPable ?? false,
        invite_emails: data.invite_emails ?? [],
        host_id: data.host_id ?? '',
      };
      events.push(event);
    });

    return events;
  } catch (error: any) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// Fetch Single Event by ID (for View Event UI)
export const fetchEventById = async (eventId: string): Promise<EventDetails | null> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const data = eventSnap.data();
      return {
        id: eventSnap.id,
        title: data?.title ?? '',
        description: data?.description ?? '',
        start_time: data?.start_time?.toDate() ?? '',
        end_time: data?.end_time?.toDate() ?? '',
        location_info: data?.location_info ?? '',
        latitude: data?.latitude ?? 0,
        longitude: data?.longitude ?? 0,
        is_private: data?.is_private ?? false,
        is_RSVPable: data?.is_RSVPable ?? false,
        invite_emails: data?.invite_emails ?? [],
        host_id: data?.host_id ?? '',
      };
    } else {
      console.error("Event not found");
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

// Edit Event
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

// Handle RSVP
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

// Invite Users (placeholder)
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
