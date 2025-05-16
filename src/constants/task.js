// Task-related constants

// Recurrence types
export const RECURRENCE_DAILY = 'daily';
export const RECURRENCE_WEEKLY = 'weekly';

// Days of the week for weekly recurrence
export const DAYS_OF_WEEK = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 }
];

// Time format options
export const TIME_FORMAT_OPTIONS = {
  hour: '2-digit', 
  minute: '2-digit'
};

// Date and time format options for upcoming and previous views
export const DATE_TIME_FORMAT_OPTIONS = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit', 
  minute: '2-digit'
};
