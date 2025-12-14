// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpwsLKZU7FCegFGc_Y7xmVPdpKJ_cLJNE",
  authDomain: "vdjhub.firebaseapp.com",
  databaseURL: "https://vdjhub-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vdjhub",
  storageBucket: "vdjhub.firebasestorage.app",
  messagingSenderId: "1027567847378",
  appId: "1:1027567847378:web:5704245a1e099568c12a0b",
  measurementId: "G-MDQRN6L3PX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);