// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCWbepFmHoN2yCqsm4pbgP8pdPTTzXGsMw",
  authDomain: "platify-8889d.firebaseapp.com",
  projectId: "platify-8889d",
  storageBucket: "platify-8889d.firebasestorage.app",
  messagingSenderId: "1017855532710",
  appId: "1:1017855532710:web:15281a2cbb5efdaacf1e67",
  measurementId: "G-YSC0WD2EYB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
