<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
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

      <button @click="logout" class="logout-button">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  // This is a placeholder for actual logout logic
  console.log('Logging out...');

  // Redirect to login page after logout
  router.push('/login');
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
</style>
