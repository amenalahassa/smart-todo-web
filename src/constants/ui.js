// UI-related constants

// View names
export const VIEW_TODAY = 'today';
export const VIEW_UPCOMING = 'upcoming';
export const VIEW_PREVIOUS = 'previous';
export const VIEW_DATE = 'date';

// Date format options
export const DATE_FORMAT_OPTIONS = { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
};

export const DATE_FORMAT_SHORT = { 
  month: 'short', 
  day: 'numeric' 
};

export const DATE_FORMAT_SHORT_WITH_YEAR = { 
  month: 'short', 
  day: 'numeric', 
  year: 'numeric' 
};

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  [VIEW_TODAY]: {
    title: "You're all caught up!",
    message: "Add a task to get started with your day."
  },
  [VIEW_UPCOMING]: {
    title: "No upcoming tasks",
    message: "Plan ahead by adding tasks for the future."
  },
  [VIEW_PREVIOUS]: {
    title: "No previous tasks",
    message: "Past tasks will appear here."
  },
  [VIEW_DATE]: {
    title: "No tasks for this date",
    message: "Try selecting a different date or add a new task."
  }
};

// Section headers
export const SECTION_HEADERS = {
  PENDING: "Pending Tasks",
  COMPLETED: "Completed Tasks"
};

// App name
export const APP_NAME = "Smart Todo App";