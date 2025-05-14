// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants/firebase';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase services
const auth = getAuth(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Log that Firestore is initialized
console.log('Firestore initialized');

// Export initialized Firebase services
export { app, auth, firestore };

// Export default for convenience
export default app;
