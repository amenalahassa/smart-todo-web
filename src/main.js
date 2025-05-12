import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import firebaseApp, { auth, firestore } from './firebase'

// Verify Firebase is initialized
console.log('Firebase App initialized:', firebaseApp.name)
console.log('Firebase Auth initialized:', auth.name)
console.log('Firebase Firestore initialized:', firestore.type)

createApp(App).mount('#app')
