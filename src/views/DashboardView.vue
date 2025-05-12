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
      <!-- Header with today's date -->
      <div class="header-section">
        <h2>Today's Tasks</h2>
        <div class="date-display">{{ formattedDate }}</div>
      </div>

      <!-- Tabs area for switching views -->
      <n-tabs type="line" animated>
        <n-tab-pane name="today" tab="Today">
          <div class="task-section">
            <!-- Loading state -->
            <div v-if="loading" class="loading-state">
              <n-spin size="large" />
              <p>Loading tasks...</p>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="error-state">
              <p>Error loading tasks: {{ error }}</p>
              <n-button @click="fetchTodayTasks" type="primary" size="small">
                Retry
              </n-button>
            </div>

            <!-- Empty state -->
            <div v-else-if="tasks.length === 0" class="empty-state">
              <p>No tasks for today. Add a task to get started!</p>
            </div>

            <!-- Task list -->
            <div v-else class="task-list">
              <TaskItem 
                v-for="task in tasks" 
                :key="task.id" 
                :task="task"
                @edit="handleEditTask"
                @delete="handleDeleteTask"
                @archive="handleArchiveTask"
              />
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="upcoming" tab="Upcoming">
          <div class="task-section">
            <p>Your upcoming tasks will appear here.</p>
          </div>
        </n-tab-pane>
        <n-tab-pane name="completed" tab="Completed">
          <div class="task-section">
            <p>Your completed tasks will appear here.</p>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Floating Action Button (FAB) -->
    <div class="fab-container">
      <button class="fab" @click="addNewTask">
        <span class="plus-icon">+</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useMessage, NTabs, NTabPane, NSpin, NButton } from 'naive-ui';
import { currentUser } from '../store/auth';
import { useTasks } from '../composables/useTasks';
import TaskItem from '../components/TaskItem.vue';

const router = useRouter();
const message = useMessage();
const { tasks, loading, error, fetchTodayTasks } = useTasks();

// Format today's date
const formattedDate = computed(() => {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('en-US', options);
});

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

const addNewTask = () => {
  message.info('Add task functionality will be implemented in future iterations');
  // This will be implemented in future iterations
};

// Task action handlers
const handleEditTask = (task) => {
  message.info(`Edit task: ${task.title}`);
  // This will be implemented in future iterations
};

const handleDeleteTask = (task) => {
  message.warning(`Delete task: ${task.title}`);
  // This will be implemented in future iterations
};

const handleArchiveTask = (task) => {
  message.success(`Archive task: ${task.title}`);
  // This will be implemented in future iterations
};
</script>

<style scoped>
.dashboard {
  max-width: 90%;
  margin: 0 auto;
  padding: 0;
  position: relative;
  min-height: 100vh;
}

.dashboard-content {
  margin-top: 20px;
  padding-bottom: 80px; /* Space for FAB */
}

/* Header section styles */
.header-section {
  margin-bottom: 20px;
}

.header-section h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 5px;
}

.date-display {
  color: #666;
  font-size: 1rem;
}

/* Task section styles */
.task-section {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  min-height: 200px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #999;
  font-style: italic;
}

.task-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Loading state styles */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 20px;
}

.loading-state p {
  color: #666;
}

/* Error state styles */
.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 15px;
}

.error-state p {
  color: #f44336;
}

/* Floating Action Button styles */
.fab-container {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.fab {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.fab:hover {
  background-color: #45a049;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.plus-icon {
  font-size: 30px;
  font-weight: bold;
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
