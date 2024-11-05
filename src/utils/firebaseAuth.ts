import { app } from './firebaseConfig';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    signOut, 
    UserCredential, 
    User 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";  // Firestore functions

const auth = getAuth(app);
const firestore = getFirestore(app);  // Initialize Firestore

// Helper function to append a symbol if the email belongs to a school domain
const appendSymbolForSchoolEmail = (email: string, displayName: string): string => {
  const schoolDomains = ["@mavs.uta.edu", "@uta.edu"];
  const isSchoolEmail = schoolDomains.some(domain => email.endsWith(domain));

  if (isSchoolEmail) {
    return displayName + " 🎓";  // Append special symbol to denote school email
  }

  return displayName;  // Return unchanged if not a school email
};

// Function to fetch user data by ID
export const fetchUserById = async (userId: string): Promise<{ email: string; username: string; host_id: string; host_email: string } | null> => {
    try {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data() as { email: string; username: string; host_id: string; host_email: string };
        } else {
            console.warn("No such user found with ID:", userId);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

// Sign up new user
export const signUp = async (email: string, password: string, displayName: string = "User"): Promise<void> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = userCredential.user;

    // Check if the user has a school domain email
    const updatedDisplayName = appendSymbolForSchoolEmail(email, displayName);

    // Store user data in Firestore, including host_id and host_email
    await setDoc(doc(firestore, "users", user.uid), {
      username: updatedDisplayName,
      email: user.email,
      createdAt: new Date().toISOString(),
      host_id: user.uid,           // Storing user ID as host_id
      host_email: user.email       // Storing user email as host_email
    });

    // Send verification email
    await sendEmailVerification(user);

    // Immediately sign out to prevent automatic login
    await signOut(auth);
  } catch (error: any) {
    console.error("Error registering user:", error.message);
    throw new Error("Sign up failed: " + error.message);  // Forward error to be handled in Signup.tsx
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user: User = userCredential.user;

    if (user.emailVerified) {
      console.log("User signed in and email verified:", user);
      //alert("Login successful!");
    } else {
      alert("Your email is not verified. Please check your inbox to verify your email.");

      const shouldResend = window.confirm("Would you like to resend the verification email?");
      if (shouldResend) {
        await sendEmailVerification(user);
        alert("Verification email sent again. Please check your inbox.");
      }

      await signOut(auth);  // Ensure user is signed out if they haven't verified
    }
  } catch (error: any) {
    console.error("Error signing in:", error.message);
    alert("Login failed: " + error.message);
  }
};

// Sign out user
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error: any) {
    console.error("Error signing out:", error.message);
  }
};

// Fetch logged-in user's email
export const getCurrentUserEmail = (): string | null => {
  const user = auth.currentUser;
  return user?.email || null;
};
