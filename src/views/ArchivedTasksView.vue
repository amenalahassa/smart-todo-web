<template>
  <div class="archived-tasks">
    <!-- Navbar with user session -->
    <div class="navbar">
      <div class="navbar-brand">
        <h1>{{ APP_NAME }}</h1>
      </div>
      <div class="navbar-user">
        <n-dropdown 
          v-if="currentUser" 
          trigger="click" 
          :options="userMenuOptions" 
          @select="handleUserMenuSelect"
        >
          <div class="avatar-container">
            <n-avatar 
              round 
              size="medium" 
              :src="currentUser.photoURL" 
              :fallback-src="getInitialsAvatar(currentUser.displayName || currentUser.email)"
            >
              {{ getInitials(currentUser.displayName || currentUser.email) }}
            </n-avatar>
          </div>
        </n-dropdown>
      </div>
    </div>

    <div class="archived-tasks-content">
      <!-- Header -->
      <div class="header-section">
        <h2>Archived Tasks</h2>
        <div class="back-link">
          <n-button text @click="goBack">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </n-icon>
            </template>
            Back to Dashboard
          </n-button>
        </div>
      </div>

      <!-- Task content area -->
      <div class="task-section">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <n-spin size="large" />
          <p>Loading archived tasks...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
          <p>Error loading archived tasks: {{ error }}</p>
          <n-button @click="fetchArchivedTasks" type="primary" size="small">
            Retry
          </n-button>
        </div>

        <!-- Empty state -->
        <div v-else-if="archivedTasks.length === 0" class="empty-state">
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
                <path fill="#666" d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
              </svg>
            </div>
            <h3 class="empty-state-title">No Archived Tasks</h3>
            <p class="empty-state-message">
              You haven't archived any tasks yet. When you archive a task, it will appear here.
            </p>
            <button class="empty-state-button" @click="goBack">
              Return to Dashboard
            </button>
          </div>
        </div>

        <!-- Archived tasks list -->
        <div v-else>
          <div class="task-list">
            <div v-for="task in archivedTasks" :key="task.id" class="archived-task-item">
              <div class="task-content">
                <h3 class="task-title">{{ task.title }}</h3>
                <p v-if="task.description" class="task-description">{{ task.description }}</p>
                <div class="task-meta">
                  <span v-if="task.recurrence" class="task-recurrence" :class="{ 'weekly': task.recurrence === 'weekly' }">
                    {{ task.recurrence }}
                    <span v-if="task.recurrence === 'weekly' && task.dayOfWeek">
                      ({{ getDayName(task.dayOfWeek) }})
                    </span>
                  </span>
                  <span v-if="task.archivedAt" class="task-archived-date">
                    Archived on {{ formatDate(task.archivedAt) }}
                  </span>
                </div>
                <div class="task-justification">
                  <p class="justification-label">Justification:</p>
                  <p class="justification-text">{{ task.archiveJustification }}</p>
                </div>
              </div>
              <div class="task-actions">
                <n-button quaternary circle size="small" @click="restoreTask(task)" class="action-button">
                  <n-icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14zM6 7v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zm8 7v4h-4v-4H8l4-4 4 4h-2z"/>
                    </svg>
                  </n-icon>
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { useMessage, NButton, NSpin, NAvatar, NDropdown, NIcon } from 'naive-ui';
import { currentUser } from '../store/auth';
import { doc, updateDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { APP_NAME } from '../constants/ui';
import { DAYS_OF_WEEK } from '../constants/task';

const router = useRouter();
const message = useMessage();

// State variables
const loading = ref(true);
const error = ref(null);
const archivedTasks = ref([]);

// User menu options for the avatar dropdown
const userMenuOptions = computed(() => {
  return [
    {
      label: currentUser.value?.displayName || currentUser.value?.email,
      key: 'user-info',
      disabled: true
    },
    {
      label: 'Back to Dashboard',
      key: 'dashboard'
    },
    {
      type: 'divider',
      key: 'd1'
    },
    {
      label: 'Logout',
      key: 'logout'
    }
  ];
});

// Handle user menu selection
const handleUserMenuSelect = (key) => {
  if (key === 'logout') {
    logout();
  } else if (key === 'dashboard') {
    router.push('/dashboard');
  }
};

// Get user initials for avatar
const getInitials = (name) => {
  if (!name) return '';
  
  // If it's an email, use the first letter
  if (name.includes('@')) {
    return name.charAt(0).toUpperCase();
  }
  
  // Otherwise, use the first letter of each word
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2); // Limit to 2 characters
};

// Generate a colored avatar with initials
const getInitialsAvatar = (name) => {
  // This is a placeholder - in a real app, you might generate a colored avatar
  return '';
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  // Handle Firestore Timestamp objects
  const date = timestamp.seconds 
    ? new Date(timestamp.seconds * 1000) 
    : new Date(timestamp);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get day name from day value
const getDayName = (dayValue) => {
  const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
  return day ? day.label : '';
};

// Fetch archived tasks
const fetchArchivedTasks = async () => {
  if (!currentUser.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Query for archived tasks
    const tasksRef = collection(firestore, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', currentUser.value.uid),
      where('status', '==', 'archived')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by archived date (newest first)
    tasks.sort((a, b) => {
      if (a.archivedAt && b.archivedAt) {
        const dateA = a.archivedAt.seconds ? a.archivedAt.seconds : a.archivedAt;
        const dateB = b.archivedAt.seconds ? b.archivedAt.seconds : b.archivedAt;
        return dateB - dateA;
      }
      return 0;
    });
    
    archivedTasks.value = tasks;
  } catch (err) {
    console.error('Error fetching archived tasks:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Restore an archived task
const restoreTask = async (task) => {
  try {
    // Update the task in Firestore to remove archived status
    const taskRef = doc(firestore, 'tasks', task.id);
    await updateDoc(taskRef, {
      status: 'active',
      archivedAt: null,
      archiveJustification: null,
      updatedAt: Timestamp.now()
    });
    
    // Show success message
    message.success({
      content: `Task "${task.title}" restored successfully`,
      duration: 4000,
      keepAliveOnHover: true
    });
    
    // Refresh the list
    fetchArchivedTasks();
  } catch (error) {
    console.error('Error restoring task:', error);
    
    // Show error message
    message.error({
      content: 'Failed to restore task: ' + error.message,
      duration: 6000,
      keepAliveOnHover: true
    });
  }
};

// Navigate back to dashboard
const goBack = () => {
  router.push('/dashboard');
};

// Logout function
const logout = async () => {
  try {
    await signOut(auth);
    message.success('Logged out successfully');
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error.message);
    message.error('Logout failed: ' + error.message);
  }
};

// Fetch archived tasks when component mounts
fetchArchivedTasks();
</script>

<style scoped>
.archived-tasks {
  max-width: 90%;
  margin: 0 auto;
  padding: 0;
  position: relative;
  min-height: 100vh;
}

.archived-tasks-content {
  margin-top: 20px;
}

/* Header section styles */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-section h2 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.back-link {
  display: flex;
  align-items: center;
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
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.archived-task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
}

.archived-task-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-title {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.task-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.task-recurrence {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.task-recurrence.weekly {
  background-color: #2196F3;
}

.task-archived-date {
  color: #666;
  font-size: 0.8rem;
}

.task-justification {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #4CAF50;
}

.justification-label {
  margin: 0 0 5px 0;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.justification-text {
  margin: 0;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.action-button {
  color: #555;
}

.action-button:hover {
  background-color: #f0f0f0;
  color: #4CAF50;
}

/* Empty state styles */
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
  opacity: 0.7;
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

.avatar-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.avatar-container:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Style the dropdown */
:deep(.n-dropdown-menu) {
  min-width: 200px;
}

:deep(.n-dropdown-option-body--disabled) {
  color: #333 !important;
  font-weight: 500;
  opacity: 1 !important;
}

:deep(.n-dropdown-divider) {
  margin: 4px 0;
}

/* Responsive styles */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .task-section {
    padding: 15px;
  }
  
  .archived-task-item {
    flex-direction: column;
  }
  
  .task-actions {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style>