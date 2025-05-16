<template>
  <div class="task-item" :class="{ 'task-completed': task.completed }">
    <div class="task-content">
      <h3 class="task-title">{{ task.title }}</h3>
      <p v-if="task.description" class="task-description">{{ task.description }}</p>
      <div class="task-meta">
        <span v-if="task.completed" class="task-status completed">
          <n-icon class="status-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></n-icon>
          Completed
        </span>
        <span v-if="task.recurrence === RECURRENCE_DAILY" class="task-recurrence">
          <n-icon class="recurrence-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6c0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6c0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4l-4-4v3z"/></svg></n-icon>
          Daily
        </span>
        <span v-if="task.recurrence === RECURRENCE_WEEKLY" class="task-recurrence weekly">
          <n-icon class="recurrence-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6c0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6c0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4l-4-4v3z"/></svg></n-icon>
          Weekly ({{ getDayName(task.dayOfWeek) }})
        </span>
        <span v-if="task.dueDate" class="task-due-date">
          <n-icon class="due-date-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm.5-13H11v6l5.2 3.2l.8-1.3l-4.5-2.7V7z"/></svg></n-icon>
          {{ formatDueDate(task.dueDate) }}
        </span>
      </div>
    </div>
    <div class="task-actions">
      <n-button quaternary circle size="small" @click="$emit('edit', task)" class="action-button">
        <n-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg></n-icon>
      </n-button>
      <n-button 
        v-if="!task.completed && (isToday || isUpcoming)" 
        quaternary 
        circle 
        size="small" 
        @click="$emit('complete', task)" 
        class="action-button complete-button"
        title="Mark as completed"
      >
        <n-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/></svg></n-icon>
      </n-button>
      <n-button quaternary circle size="small" @click="$emit('archive', task)" class="action-button">
        <n-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg></n-icon>
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { NButton, NIcon } from 'naive-ui';
import { computed } from 'vue';
import { RECURRENCE_DAILY, RECURRENCE_WEEKLY, DAYS_OF_WEEK, TIME_FORMAT_OPTIONS } from '../constants/task';
import { VIEW_TODAY, VIEW_UPCOMING } from '../constants/ui';

// Define props
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  activeView: {
    type: String,
    default: VIEW_TODAY
  }
});

// Define emits
defineEmits(['edit', 'archive', 'complete']);

// Computed properties to determine if task is for today or upcoming
const isToday = computed(() => props.activeView === VIEW_TODAY);
const isUpcoming = computed(() => props.activeView === VIEW_UPCOMING);

// Format due date
const formatDueDate = (dueDate) => {
  if (!dueDate) return '';

  // Handle Firestore Timestamp objects
  const date = dueDate.seconds 
    ? new Date(dueDate.seconds * 1000) 
    : new Date(dueDate);

  return date.toLocaleTimeString([], TIME_FORMAT_OPTIONS);
};

// Get day name from day value
const getDayName = (dayValue) => {
  const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
  return day ? day.label : '';
};
</script>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-item:hover {
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-completed {
  opacity: 0.7;
}

.task-completed .task-title {
  text-decoration: line-through;
  color: #888;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.task-title {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.task-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.task-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  align-items: center;
}

.task-recurrence {
  display: flex;
  align-items: center;
  background-color: #4CAF50;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  gap: 4px;
}

.task-recurrence.weekly {
  background-color: #2196F3; /* Blue color for weekly tasks */
}

.task-status.completed {
  display: flex;
  align-items: center;
  background-color: #4CAF50;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  gap: 4px;
}

.status-icon, .recurrence-icon, .due-date-icon {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.complete-button:hover {
  color: #4CAF50;
}

.task-due-date {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 0.8rem;
  gap: 4px;
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.action-button {
  color: #555;
}

.action-button:hover {
  background-color: #f0f0f0;
}

</style>
