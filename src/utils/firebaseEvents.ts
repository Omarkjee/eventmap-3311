import { app } from './firebaseConfig';
import { 
  getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, 
  Timestamp, deleteDoc, query, where, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);
const auth = getAuth(app);

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
  host_email: string;
  RSVP_users: string[]; // Added field to track RSVPs
};

// Create Event
export const createEvent = async (eventDetails: {
  is_private: boolean;
  start_time: Date | string;
  is_RSVPable: boolean;
  invite_emails: string[];
  latitude: number;
  end_time: Date | string;
  description: string;
  title: string;
  location_info: string;
  host_id: string;
  longitude: number;
}): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User not authenticated or email not available");
    }

    const eventRef = await addDoc(collection(db, 'events'), {
      ...eventDetails,
      is_RSVPable: true,
      start_time: Timestamp.fromDate(new Date(eventDetails.start_time)),
      end_time: Timestamp.fromDate(new Date(eventDetails.end_time)),
      invite_emails: eventDetails.is_private ? eventDetails.invite_emails : [],
      host_id: user.uid,
      host_email: user.email,
      RSVP_users: [], // Initialize with an empty array
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

    return eventRef.id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// RSVP to Event
export const RSVPToEvent = async (eventId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error("Event not found");
    }

    const eventData = eventSnap.data();
    if (!eventData.is_RSVPable) {
      throw new Error("RSVP is not allowed for this event");
    }

    // Add or remove user's UID from the RSVP_users array
    const userRSVPed = eventData.RSVP_users.includes(user.uid);
    if (userRSVPed) {
      // Remove the user from RSVP list
      await updateDoc(eventRef, {
        RSVP_users: arrayRemove(user.uid), // Remove UID from RSVP_users array
        updated_at: Timestamp.now(),
      });
      console.log(`User ${user.uid} removed RSVP from event ${eventId}`);
    } else {
      // Add the user to RSVP list
      await updateDoc(eventRef, {
        RSVP_users: arrayUnion(user.uid), // Add UID to RSVP_users array
        updated_at: Timestamp.now(),
      });
      console.log(`User ${user.uid} RSVP'd to event ${eventId}`);
    }
  } catch (error) {
    console.error("Error RSVPing to event:", error);
    throw error;
  }
};



// Edit Event
export const editEvent = async (eventId: string, updatedDetails: Partial<EventDetails>): Promise<void> => {
  try {
    const user = auth.currentUser;
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists() && eventSnap.data().host_email === user?.email) {
      await updateDoc(eventRef, {
        ...updatedDetails,
        is_RSVPable: true,
        updated_at: Timestamp.now(),
      });
    } else {
      throw new Error("Only the host can edit this event");
    }
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

// Helper function to ensure we get a Date object
const convertToDate = (field: any) => {
  if (field instanceof Date) {
    return field;
  }
  if (field?.toDate) {
    return field.toDate();
  }
  return new Date(field);
};

// Fetch All Events
export const fetchEvents = async (): Promise<EventDetails[]> => {
  try {
    //cleanup old events
    await cleanupOldEvents();


    const querySnapshot = await getDocs(collection(db, 'events'));
    let events: EventDetails[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: EventDetails = {
        id: doc.id,
        title: data.title ?? '',
        description: data.description ?? '',
        start_time: convertToDate(data.start_time),
        end_time: convertToDate(data.end_time),
        location_info: data.location_info ?? '',
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        is_private: data.is_private ?? false,
        is_RSVPable: true,
        invite_emails: data.invite_emails ?? [],
        host_id: data.host_id ?? '',
        host_email: data.host_email ?? '',
        RSVP_users: data.RSVP_users ?? [], // Include RSVP users
      };
      events.push(event);
    });

    return events;
  } catch (error: any) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// Fetch Single Event by ID
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
        start_time: convertToDate(data.start_time),
        end_time: convertToDate(data.end_time),
        location_info: data?.location_info ?? '',
        latitude: data?.latitude ?? 0,
        longitude: data?.longitude ?? 0,
        is_private: data?.is_private ?? false,
        is_RSVPable: true,
        invite_emails: data?.invite_emails ?? [],
        host_id: data?.host_id ?? '',
        host_email: data?.host_email ?? '',
        RSVP_users: data?.RSVP_users ?? [], // Include RSVP users
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

// Delete Event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    console.log("Event deleted with ID:", eventId);
    await fetchEvents()
  } catch (error: any) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// Cleanup old events past their end date
export const cleanupOldEvents = async (): Promise<void> => {
  try {
    const now = Timestamp.now();
    const eventsRef = collection(db, 'events');
    const oldEventsQuery = query(eventsRef, where('end_time', '<', now));
    const oldEventsSnapshot = await getDocs(oldEventsQuery);

    for (const eventDoc of oldEventsSnapshot.docs) {
      await deleteDoc(eventDoc.ref);
      console.log("Deleted old event with ID:", eventDoc.id);
    }
  } catch (error: any) {
    console.error("Error cleaning up old events:", error);
  }
};
