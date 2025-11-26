import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "live-code-interviewer-sv.firebaseapp.com",
  projectId: "live-code-interviewer-sv",
  storageBucket: "live-code-interviewer-sv.appspot.com",
  messagingSenderId: "801834174909",
  appId: "1:801834174909:web:33da1136e14a901f862ad4",
  measurementId: "G-75Z1VG7Z60",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
let analytics;

if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { firestore, analytics };
