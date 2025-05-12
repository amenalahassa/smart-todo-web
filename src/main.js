import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import firebaseApp, { auth, firestore } from './firebase'

// Verify Firebase is initialized
console.log('Firebase App initialized:', firebaseApp.name)
console.log('Firebase Auth initialized:', auth.name)
console.log('Firebase Firestore initialized:', firestore.type)

const app = createApp(App)
app.use(router)
app.mount('#app')
