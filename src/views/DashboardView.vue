<template>
  <div class="dashboard">
    <!-- Navbar with user session -->
    <div class="navbar">
      <div class="navbar-brand">
        <h1>{{ APP_NAME }}</h1>
      </div>
      <div class="navbar-user">
        <span v-if="currentUser" class="user-email">{{ currentUser.email }}</span>
        <button @click="logout" class="logout-button">Logout</button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Header with dynamic title based on active view -->
      <div class="header-section">
        <h2>
          <span v-if="activeView === VIEW_TODAY">Today's Tasks</span>
          <span v-else-if="activeView === VIEW_UPCOMING">Upcoming Tasks</span>
          <span v-else-if="activeView === VIEW_PREVIOUS">Previous Tasks</span>
          <span v-else-if="activeView === VIEW_DATE">Tasks for Selected Date</span>
        </h2>
        <div class="date-display">{{ formattedDate }}</div>
      </div>

      <!-- Date Navigator - Sub-tabs for switching between time periods -->
      <div class="date-navigator">
        <div class="date-navigator-controls">
          <n-tabs 
            type="segment" 
            :value="activeView" 
            @update:value="handleViewChange" 
            size="large"
            animated
            class="view-tabs"
          >
            <n-tab-pane :name="VIEW_TODAY" tab="Today" />
            <n-tab-pane :name="VIEW_UPCOMING" tab="Upcoming" />
            <n-tab-pane :name="VIEW_PREVIOUS" tab="Previous" />
          </n-tabs>

          <!-- Date Picker for filtering tasks by specific date -->
          <div class="date-picker-container">
            <n-date-picker 
              v-model:value="selectedDate" 
              type="date" 
              clearable
              :actions="['clear', 'confirm']"
              @update:value="handleDateChange"
              placeholder="Filter by date"
            />
          </div>
        </div>
      </div>

      <!-- Task content area -->
      <div class="task-section">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <n-spin size="large" />
          <p>Loading tasks...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
          <p>Error loading tasks: {{ error }}</p>
          <n-button @click="() => fetchTasks(activeView)" type="primary" size="small">
            Retry
          </n-button>
        </div>

        <!-- Empty state -->
        <div v-else-if="pendingTasks.length === 0 && completedTasks.length === 0" class="empty-state">
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
                <path fill="#4CAF50" d="M19,3H5C3.89,3,3,3.89,3,5v14c0,1.11,0.89,2,2,2h14c1.11,0,2-0.89,2-2V5C21,3.89,20.11,3,19,3z M10,17l-5-5l1.41-1.41 L10,14.17l7.59-7.59L19,8L10,17z"/>
              </svg>
            </div>
            <h3 class="empty-state-title">
              {{ EMPTY_STATE_MESSAGES[activeView].title }}
            </h3>
            <p class="empty-state-message">
              {{ EMPTY_STATE_MESSAGES[activeView].message }}
            </p>
            <button class="empty-state-button" @click="addNewTask">
              <span class="button-icon">+</span>
              Add a Task
            </button>
          </div>
        </div>

        <!-- Task list -->
        <div v-else>
          <!-- Pending Tasks Section -->
          <div v-if="pendingTasks.length > 0" class="task-section-header">
            <h3>{{ SECTION_HEADERS.PENDING }}</h3>
          </div>
          <div v-if="pendingTasks.length > 0" class="task-list">
            <TaskItem 
              v-for="task in pendingTasks" 
              :key="task.id" 
              :task="task"
              @edit="handleEditTask"
              @delete="handleDeleteTask"
              @archive="handleArchiveTask"
            />
          </div>

          <!-- Completed Tasks Section -->
          <div v-if="completedTasks.length > 0" class="task-section-header">
            <h3>{{ SECTION_HEADERS.COMPLETED }}</h3>
          </div>
          <div v-if="completedTasks.length > 0" class="task-list completed-tasks">
            <TaskItem 
              v-for="task in completedTasks" 
              :key="task.id" 
              :task="task"
              @edit="handleEditTask"
              @delete="handleDeleteTask"
              @archive="handleArchiveTask"
            />
          </div>
        </div>
      </div>
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
import { useMessage, NTabs, NTabPane, NSpin, NButton, NDatePicker } from 'naive-ui';
import { currentUser } from '../store/auth';
import { useTasks } from '../composables/useTasks';
import TaskItem from '../components/TaskItem.vue';
import { 
  VIEW_TODAY, 
  VIEW_UPCOMING, 
  VIEW_PREVIOUS, 
  VIEW_DATE, 
  DATE_FORMAT_OPTIONS, 
  DATE_FORMAT_SHORT, 
  DATE_FORMAT_SHORT_WITH_YEAR,
  EMPTY_STATE_MESSAGES,
  SECTION_HEADERS,
  APP_NAME
} from '../constants/ui';

const router = useRouter();
const message = useMessage();
const { 
  tasks, 
  loading, 
  error, 
  activeView, 
  selectedDate,
  fetchTasks,
  fetchTasksByDate,
} = useTasks();

// Computed property to filter and sort pending tasks
const pendingTasks = computed(() => {
  return tasks.value
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Sort by due date (ascending)
      if (a.dueDate && b.dueDate) {
        const dateA = a.dueDate.seconds ? a.dueDate.seconds : a.dueDate;
        const dateB = b.dueDate.seconds ? b.dueDate.seconds : b.dueDate;
        return dateA - dateB;
      }
      // If only one task has a due date, it comes first
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      // If neither has a due date, sort by title
      return a.title.localeCompare(b.title);
    });
});

// Computed property to filter and sort completed tasks
const completedTasks = computed(() => {
  return tasks.value
    .filter(task => task.completed)
    .sort((a, b) => {
      // Sort by completion date (descending) if available
      if (a.completedAt && b.completedAt) {
        const dateA = a.completedAt.seconds ? a.completedAt.seconds : a.completedAt;
        const dateB = b.completedAt.seconds ? b.completedAt.seconds : b.completedAt;
        return dateB - dateA; // Most recently completed first
      }
      // If completion date is not available, sort by title
      return a.title.localeCompare(b.title);
    });
});

// Format date based on active view
const formattedDate = computed(() => {
  const today = new Date();

  if (activeView.value === VIEW_TODAY) {
    return today.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  } else if (activeView.value === VIEW_UPCOMING) {
    // For upcoming, show the date range (e.g., "Next 7 days")
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return `${today.toLocaleDateString('en-US', DATE_FORMAT_SHORT)} - ${nextWeek.toLocaleDateString('en-US', DATE_FORMAT_SHORT_WITH_YEAR)}`;
  } else if (activeView.value === VIEW_PREVIOUS) {
    // For previous, show the date range (e.g., "Last 30 days")
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);
    return `${lastMonth.toLocaleDateString('en-US', DATE_FORMAT_SHORT)} - ${today.toLocaleDateString('en-US', DATE_FORMAT_SHORT_WITH_YEAR)}`;
  } else if (activeView.value === VIEW_DATE && selectedDate.value) {
    // For specific date, show the selected date
    const date = new Date(selectedDate.value);
    return date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  }

  return today.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
});

// Handle tab change
const handleViewChange = (view) => {
  fetchTasks(view);
};

// Handle date selection from date picker
const handleDateChange = (date) => {
  if (date) {
    fetchTasksByDate(date);
  } else {
    // If date is cleared, go back to today's view
    fetchTasks('today');
  }
};

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
  margin-bottom: 15px;
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

/* Date Navigator styles */
.date-navigator {
  margin-bottom: 20px;
}

.date-navigator-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.view-tabs {
  margin-bottom: 5px;
  flex-grow: 1;
}

.date-picker-container {
  min-width: 200px;
  max-width: 250px;
}

/* Make the tabs look more app-like */
:deep(.n-tabs-nav) {
  justify-content: center;
  padding: 0 10px;
}

:deep(.n-tabs-nav-item) {
  padding: 12px 24px;
  font-weight: 500;
  font-size: 1.05rem;
}

:deep(.n-tabs-tab-wrapper) {
  padding: 0 5px;
}

:deep(.n-tabs-tab) {
  transition: all 0.3s ease;
}

:deep(.n-tabs-tab:hover) {
  color: #4CAF50;
}

:deep(.n-tabs-tab.n-tabs-tab--active) {
  color: #4CAF50;
  font-weight: 600;
}

:deep(.n-tabs-nav__line) {
  background-color: #4CAF50;
}

/* Task section styles */
.task-section {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #666;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
}

.empty-state-icon {
  margin-bottom: 20px;
  opacity: 0.9;
}

.empty-state-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 10px 0;
}

.empty-state-message {
  margin: 0 0 25px 0;
  font-size: 1rem;
}

.empty-state-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.empty-state-button:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.button-icon {
  font-size: 18px;
  font-weight: bold;
  margin-right: 8px;
}

.task-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-section-header {
  margin-top: 20px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #eee;
}

.task-section-header h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

/* Styling for the completed tasks section */
.completed-tasks {
  margin-top: 10px;
  margin-bottom: 20px;
  opacity: 0.8; /* Slightly faded appearance */
}

/* Add a visual separator between pending and completed tasks */
.task-section-header:nth-of-type(2) {
  margin-top: 30px;
  border-bottom-color: #ddd;
}

.task-section-header:nth-of-type(2) h3 {
  color: #666; /* Darker color for completed section header */
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
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .date-navigator {
    overflow-x: auto;
  }

  .date-navigator-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .date-picker-container {
    min-width: 100%;
    max-width: 100%;
    margin-top: 10px;
  }

  :deep(.n-tabs-nav-item) {
    padding: 10px 16px;
    font-size: 0.95rem;
  }

  .task-section {
    padding: 15px;
  }

  .header-section h2 {
    font-size: 1.5rem;
  }
}
</style>
