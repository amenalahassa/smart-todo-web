import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import firebaseApp, { auth, firestore } from './firebase'
import createNaiveUI from './plugins/naive'

// Verify Firebase is initialized
console.log('Firebase App initialized:', firebaseApp.name)
console.log('Firebase Auth initialized:', auth.name)
console.log('Firebase Firestore initialized:', firestore.type)

// Create Naive UI instance using the plugin
const naive = createNaiveUI()

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')
