<template>
  <div class="dashboard">
    <!-- Navbar with user session -->
    <div class="navbar">
      <div class="navbar-brand">
        <h1>Smart Todo App</h1>
      </div>
      <div class="navbar-user">
        <span v-if="currentUser" class="user-email">{{ currentUser.email }}</span>
        <button @click="logout" class="logout-button">Logout</button>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="welcome-message">
        <h2>Welcome to your Todo Dashboard</h2>
        <p>This is where you'll manage your tasks and stay organized.</p>
      </div>

      <div class="task-section">
        <h3>Your Tasks</h3>
        <p>No tasks yet. Start adding some!</p>
        <!-- Task list will be implemented in future iterations -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useMessage } from 'naive-ui';
import { currentUser } from '../store/auth';

const router = useRouter();
const message = useMessage();

const logout = async () => {
  try {
    // Use Firebase Auth to sign out
    await signOut(auth);

    message.success('Logged out successfully');

    // Redirect to login page after logout
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error.message);
    message.error('Logout failed: ' + error.message);
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 90%;
  margin: 0 auto;
  padding: 0;
}

.dashboard-content {
  margin-top: 20px;
}

.welcome-message {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.task-section {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.logout-button {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #d32f2f;
}

/* Navbar styles */
.navbar {
  background-color: #4CAF50;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 20px;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.5rem;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-email {
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 4px;
}
</style>
