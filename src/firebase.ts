import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp2b7jV_buSTh2xCOZ-KPACcTnUsa03_0",
  authDomain: "familyfuntime-5b90a.firebaseapp.com",
  databaseURL: "https://familyfuntime-5b90a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "familyfuntime-5b90a",
  storageBucket: "familyfuntime-5b90a.firebasestorage.app",
  messagingSenderId: "443167905639",
  appId: "1:443167905639:web:dba65bf4a6e065c94a81c2",
  measurementId: "G-Z42EW1JEND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue };
