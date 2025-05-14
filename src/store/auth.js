// src/store/auth.js
import { ref } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { USER_STORAGE_KEY } from '../constants/storage';

// Create a reactive reference to hold the current user
const currentUser = ref(null);
// Flag to track if auth state has been initialized
const isAuthReady = ref(false);

// Function to save user data to localStorage
function saveUserToLocalStorage(user) {
  if (user) {
    // Store only necessary user data, not the entire user object
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  } else {
    // Remove user data from localStorage when user logs out
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

// Function to get user data from localStorage
function getUserFromLocalStorage() {
  const userData = localStorage.getItem(USER_STORAGE_KEY);
  return userData ? JSON.parse(userData) : null;
}

// Initialize auth state listener
export function initializeAuth() {
  return new Promise((resolve) => {
    // Check localStorage for existing user data
    const storedUser = getUserFromLocalStorage();
    if (storedUser) {
      currentUser.value = storedUser;
      isAuthReady.value = true;
      resolve(storedUser);
    }

    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
      // Save user data to localStorage
      saveUserToLocalStorage(user);

      // Mark auth as ready once we've received the initial state
      // Only if it wasn't already initialized from localStorage
      if (!isAuthReady.value) {
        isAuthReady.value = true;
        resolve(user);
      }
    });

    // Return unsubscribe function for cleanup
    return unsubscribe;
  });
}

// Export reactive references for use in components and router
export { currentUser, isAuthReady };
