import { app } from './firebaseConfig';

// Import Firebase Auth and Firestore
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";  // Firestore functions

const auth = getAuth(app);
const firestore = getFirestore(app);  // Initialize Firestore

// Helper function to append a symbol if the email belongs to a school domain
const appendSymbolForSchoolEmail = (email, displayName) => {
  const schoolDomains = ["@mavs.uta.edu", "@uta.edu"];
  const isSchoolEmail = schoolDomains.some(domain => email.endsWith(domain));

  if (isSchoolEmail) {
    return displayName + " 🎓";  // Append special symbol to denote school email
  }

  return displayName;  // Return unchanged if not a school email
};

// Sign up new user
const signUp = async (email, password, displayName = "User") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the user has a school domain email
    const updatedDisplayName = appendSymbolForSchoolEmail(email, displayName);

    // Store user data in Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      username: updatedDisplayName,
      email: user.email,
      createdAt: new Date().toISOString(),
    });

    console.log("User registered and data stored in Firestore:", user);
  } catch (error) {
    console.error("Error registering user:", error.message);
  }
};

// Log in existing user
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user);
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};

// Sign out user
const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
};

// Export the auth functions
export { signUp, signIn, logOut };
