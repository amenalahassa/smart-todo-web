# 🗂️ To-Do App Frontend (Vue 3 + Firebase + PWA)

This project is a voice-enabled to-do application designed to help users manage daily tasks more intuitively and efficiently. The frontend is built using Vue.js with Firebase for authentication and data storage, and it is packaged as a Progressive Web App (PWA) for seamless installation and offline access. Users can add and view their tasks, including recurring daily tasks, and interact with the interface using voice input. The app aims to deliver a fast, accessible, and mobile-friendly experience right out of the box.

The backend is developed using FastAPI and will evolve into an intelligent agentic system in later phases. Initially, it provides a simple REST API for managing tasks and supporting recurrent task logic. In Phase 2, the backend will integrate CrewAI and Gemini AI to allow natural language interactions. This will enable users to speak to the app conversationally—for example, to create, reschedule, or prioritize tasks—bringing intelligent automation and context-aware planning into a lightweight and modern productivity tool.

## ✅ Phase 1 Features
- Add and list tasks
- Daily recurring task support
- Voice input (Web Speech API)
- Firebase authentication (email)
- PWA installable on desktop/mobile

## 🛠️ Setup

### Install dependencies
```bash
npm install
```

### Configure Firebase Environment Variables
1. Create a `.env` file in the root directory based on the `.env.example` template
2. Fill in your Firebase credentials:
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase app ID

You can obtain these credentials from your Firebase console.

## 🧪 Development

```bash
npm run dev
```

## 🏗️ Build for Production

```bash
npm run build
```

## 🧠 Phase 2 Preview

* Connect to backend AI agent endpoint
* Use Gemini + CrewAI to interpret voice commands and trigger task actions
