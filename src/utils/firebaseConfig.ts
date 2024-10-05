// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhX17IunQPxlZLQWSM0p9kUv7KJxFpy3E",
  authDomain: "uta-event-mapper.firebaseapp.com",
  projectId: "uta-event-mapper",
  storageBucket: "uta-event-mapper.appspot.com",
  messagingSenderId: "973226761427",
  appId: "1:973226761427:web:b9752114ea8d1e6d934826",
  measurementId: "G-RGMLJ2X2DN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app,analytics };