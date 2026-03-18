// Firebase core & analytics (loaded as ES modules from CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyA1ruPRNv-os0h6qY1qzLJ1Bzozzyc3vFo",
  authDomain: "agrotek-c6c96.firebaseapp.com",
  projectId: "agrotek-c6c96",
  storageBucket: "agrotek-c6c96.firebasestorage.app",
  messagingSenderId: "265667037214",
  appId: "1:265667037214:web:e0b08b50d1b5f52dad860f",
  measurementId: "G-BY022PYE2T"
};

// Initialize Firebase app & analytics once and re-use
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

