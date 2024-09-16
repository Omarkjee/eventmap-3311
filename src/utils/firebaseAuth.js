import { app } from './firebaseConfig';

// Import Firebase Auth and Firestore
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,sendEmailVerification, signOut } from "firebase/auth";
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

    // Send verification email
    await sendEmailVerification(user);
    console.log("User registered and verification email sent:", user);

    alert("Verification email sent! Please check your inbox to verify your email.");
  } catch (error) {
    console.error("Error registering user:", error.message);
  }
};

//Sign in existing user
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user.emailVerified) {
      // If the email is verified, allow access
      console.log("User signed in and email verified:", user);
      // Redirect the user to your app's main page
    } else {
      // If the email is not verified, alert the user and give them an option to resend the verification email
      alert("Your email is not verified. Please check your inbox to verify your email.");
      
      // Ask the user if they'd like to resend the verification email
      const shouldResend = window.confirm("Would you like to resend the verification email?");
      if (shouldResend) {
        // Resend the verification email
        await sendEmailVerification(user);
        alert("Verification email sent again. Please check your inbox.");
      }
      
      // Optionally, sign the user out to prevent access until the email is verified
      await auth.signOut();
    }
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
