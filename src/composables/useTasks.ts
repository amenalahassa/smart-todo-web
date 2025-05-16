import { ref, onMounted, watch } from 'vue';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import { currentUser } from '../store/auth';
import { ACTIVE_VIEW_STORAGE_KEY, SELECTED_DATE_STORAGE_KEY, SELECTED_DATE_RANGE_STORAGE_KEY } from '../constants/storage';
import { VIEW_TODAY, VIEW_UPCOMING, VIEW_PREVIOUS, VIEW_DATE } from '../constants/ui';
import { RECURRENCE_DAILY, RECURRENCE_WEEKLY } from '../constants/task';

// Function to save active view to localStorage
const saveActiveViewToStorage = (view) => {
  localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, view);
};

// Function to save selected date to localStorage
const saveSelectedDateToStorage = (date) => {
  if (date) {
    localStorage.setItem(SELECTED_DATE_STORAGE_KEY, date.toString());
  } else {
    localStorage.removeItem(SELECTED_DATE_STORAGE_KEY);
  }
};

// Function to save selected date range to localStorage
const saveSelectedDateRangeToStorage = (dateRange) => {
  if (dateRange && dateRange[0] && dateRange[1]) {
    localStorage.setItem(SELECTED_DATE_RANGE_STORAGE_KEY, JSON.stringify([
      dateRange[0].toString(),
      dateRange[1].toString()
    ]));
  } else {
    localStorage.removeItem(SELECTED_DATE_RANGE_STORAGE_KEY);
  }
};

// Function to get active view from localStorage
const getActiveViewFromStorage = () => {
  return localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY) || VIEW_TODAY;
};

// Function to get selected date from localStorage
const getSelectedDateFromStorage = () => {
  const storedDate = localStorage.getItem(SELECTED_DATE_STORAGE_KEY);
  return storedDate ? new Date(storedDate) : null;
};

// Function to get selected date range from localStorage
const getSelectedDateRangeFromStorage = () => {
  const storedDateRange = localStorage.getItem(SELECTED_DATE_RANGE_STORAGE_KEY);
  if (storedDateRange) {
    try {
      const [startDate, endDate] = JSON.parse(storedDateRange);
      return [new Date(startDate), new Date(endDate)];
    } catch (e) {
      console.error('Error parsing date range from localStorage:', e);
      return null;
    }
  }
  return null;
};

export function useTasks() {
  const tasks = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const activeView = ref(getActiveViewFromStorage()); // Initialize from localStorage or default to VIEW_TODAY
  const selectedDate = ref(getSelectedDateFromStorage()); // Initialize from localStorage or default to null
  const selectedDateRange = ref(getSelectedDateRangeFromStorage()); // Initialize date range from localStorage

  // Function to get today's date at midnight (start of day)
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Function to fetch today's tasks
  const fetchTodayTasks = async () => {
    if (!currentUser.value) return;

    loading.value = true;
    error.value = null;
    activeView.value = VIEW_TODAY;
    saveActiveViewToStorage(VIEW_TODAY);

    // Clear selected date when fetching today's tasks
    try {
      const todayStart = getTodayDate();
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // Create a query for tasks due today or with daily recurrence
      const tasksRef = collection(firestore, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('dueDate', '>=', Timestamp.fromDate(todayStart)),
        where('dueDate', '<', Timestamp.fromDate(todayEnd))
      );

      // Execute the query
      const querySnapshot = await getDocs(q);
      const todayTasks = [];

      // Process query results
      querySnapshot.forEach((doc) => {
        todayTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Query for daily recurring tasks
      const recurringQuery = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('recurrence', 'in', [RECURRENCE_DAILY, RECURRENCE_WEEKLY])
      );

      const recurringSnapshot = await getDocs(recurringQuery);

      // Add recurring tasks, avoiding duplicates
      recurringSnapshot.forEach((doc) => {
        const taskData = {
          id: doc.id,
          ...doc.data()
        };

        // Check if this task is already in the list (from the first query)
        const exists = todayTasks.some(task => task.id === taskData.id);
        if (!exists) {
          todayTasks.push(taskData);
        }
      });

      tasks.value = todayTasks;
    } catch (err) {
      console.error('Error fetching tasks:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Function to fetch upcoming tasks (future tasks)
  const fetchUpcomingTasks = async () => {
    if (!currentUser.value) return;

    loading.value = true;
    error.value = null;
    activeView.value = VIEW_UPCOMING;
    saveActiveViewToStorage(VIEW_UPCOMING);

    try {
      const tomorrow = getTodayDate();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Create a query for tasks due after today
      const tasksRef = collection(firestore, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('dueDate', '>=', Timestamp.fromDate(tomorrow))
      );

      // Execute the query
      const querySnapshot = await getDocs(q);
      const upcomingTasks = [];

      // Process query results
      querySnapshot.forEach((doc) => {
        upcomingTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Query for daily recurring tasks
      const recurringQuery = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('recurrence', 'in', [RECURRENCE_DAILY, RECURRENCE_WEEKLY])
      );

      const recurringSnapshot = await getDocs(recurringQuery);

      // Add recurring tasks, avoiding duplicates
      recurringSnapshot.forEach((doc) => {
        const taskData = {
          id: doc.id,
          ...doc.data()
        };

        // Check if this task is already in the list (from the first query)
        const exists = upcomingTasks.some(task => task.id === taskData.id);
        if (!exists) {
          upcomingTasks.push(taskData);
        }
      });

      tasks.value = upcomingTasks;
    } catch (err) {
      console.error('Error fetching upcoming tasks:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Function to fetch previous tasks (past tasks)
  const fetchPreviousTasks = async () => {
    if (!currentUser.value) return;

    loading.value = true;
    error.value = null;
    activeView.value = VIEW_PREVIOUS;
    saveActiveViewToStorage(VIEW_PREVIOUS);

    try {
      // const today = getTodayDate();
      const today = new Date();

      // Create a query for tasks due before today
      const tasksRef = collection(firestore, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('dueDate', '<', Timestamp.fromDate(today))
      );

      // Execute the query
      const querySnapshot = await getDocs(q);
      const previousTasks = [];

      // Process query results
      querySnapshot.forEach((doc) => {
        previousTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      tasks.value = previousTasks;
    } catch (err) {
      console.error('Error fetching previous tasks:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Function to fetch tasks for a specific date
  const fetchTasksByDate = async (date) => {
    if (!currentUser.value || !date) return;

    loading.value = true;
    error.value = null;
    activeView.value = VIEW_DATE;
    selectedDate.value = date;
    saveActiveViewToStorage(VIEW_DATE);
    saveSelectedDateToStorage(date);

    try {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);

      // Create a query for tasks due on the specific date
      const tasksRef = collection(firestore, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('dueDate', '>=', Timestamp.fromDate(dateStart)),
        where('dueDate', '<', Timestamp.fromDate(dateEnd))
      );

      // Execute the query
      const querySnapshot = await getDocs(q);
      const dateTasks = [];

      // Process query results
      querySnapshot.forEach((doc) => {
        dateTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Query for daily recurring tasks
      const recurringQuery = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('recurrence', '==', RECURRENCE_DAILY)
      );

      const recurringSnapshot = await getDocs(recurringQuery);

      // Add recurring tasks, avoiding duplicates
      recurringSnapshot.forEach((doc) => {
        const taskData = {
          id: doc.id,
          ...doc.data()
        };

        // Check if this task is already in the list (from the first query)
        const exists = dateTasks.some(task => task.id === taskData.id);
        if (!exists) {
          dateTasks.push(taskData);
        }
      });

      tasks.value = dateTasks;
    } catch (err) {
      console.error('Error fetching tasks for date:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Function to fetch tasks for a date range within the current view
  const fetchTasksByDateRange = async (dateRange, view) => {
    if (!currentUser.value || !dateRange || !dateRange[0] || !dateRange[1]) return;

    loading.value = true;
    error.value = null;
    // Keep the current view instead of changing to VIEW_DATE
    // activeView.value = view; // Keep the current view (today, upcoming, previous)
    selectedDateRange.value = dateRange;
    // saveActiveViewToStorage(view); // Keep the current view in storage
    saveSelectedDateRangeToStorage(dateRange);

    try {
      const startDate = new Date(dateRange[0]);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange[1]);
      endDate.setHours(23, 59, 59, 999); // End of the day

      // Create a query for tasks due within the date range
      const tasksRef = collection(firestore, 'tasks');
      let filteredTasks = [];

      // Different queries based on the current view
      if (view === VIEW_TODAY) {
        // For today view, filter tasks due today within the specified time range
        const today = getTodayDate();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const q = query(
          tasksRef,
          where('userId', '==', currentUser.value.uid),
          where('dueDate', '>=', Timestamp.fromDate(startDate)),
          where('dueDate', '<=', Timestamp.fromDate(endDate))
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          filteredTasks.push({
            id: doc.id,
            ...doc.data()
          });
        });

      } else if (view === VIEW_UPCOMING) {
        // For upcoming view, filter future tasks within the specified date range
        const tomorrow = getTodayDate();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const q = query(
          tasksRef,
          where('userId', '==', currentUser.value.uid),
          where('dueDate', '>=', Timestamp.fromDate(tomorrow > startDate ? tomorrow : startDate)),
          where('dueDate', '<=', Timestamp.fromDate(endDate))
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          filteredTasks.push({
            id: doc.id,
            ...doc.data()
          });
        });

      } else if (view === VIEW_PREVIOUS) {
        // For previous view, filter past tasks within the specified date range
        const today = getTodayDate();

        const q = query(
          tasksRef,
          where('userId', '==', currentUser.value.uid),
          where('dueDate', '>=', Timestamp.fromDate(startDate)),
          where('dueDate', '<', Timestamp.fromDate(today < endDate ? today : endDate))
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          filteredTasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }

      // Query for recurring tasks based on the view
      const recurringQuery = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('recurrence', 'in', [RECURRENCE_DAILY, RECURRENCE_WEEKLY])
      );

      const recurringSnapshot = await getDocs(recurringQuery);

      // Add recurring tasks, avoiding duplicates
      recurringSnapshot.forEach((doc) => {
        const taskData = {
          id: doc.id,
          ...doc.data()
        };

        // Check if this task is already in the list (from the first query)
        const exists = filteredTasks.some(task => task.id === taskData.id);
        if (!exists) {
          filteredTasks.push(taskData);
        }
      });

      tasks.value = filteredTasks;
    } catch (err) {
      console.error('Error fetching tasks for date range:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Function to fetch tasks based on the active view
  const fetchTasks = async (view = VIEW_TODAY) => {
    // If a date is selected, clear it when switching views
    if (view !== VIEW_DATE) {
      selectedDate.value = null;
      saveSelectedDateToStorage(null);
    }

    // Clear date range when switching views
    selectedDateRange.value = null;
    saveSelectedDateRangeToStorage(null);

    // Save the active view to localStorage
    saveActiveViewToStorage(view);

    switch (view) {
      case VIEW_TODAY:
        await fetchTodayTasks();
        break;
      case VIEW_UPCOMING:
        await fetchUpcomingTasks();
        break;
      case VIEW_PREVIOUS:
        await fetchPreviousTasks();
        break;
      case VIEW_DATE:
        if (selectedDate.value) {
          await fetchTasksByDate(selectedDate.value);
        } else {
          await fetchTodayTasks();
        }
        break;
      default:
        await fetchTodayTasks();
    }
  };

  // Fetch tasks when component mounts
  onMounted(() => {
    // If we have a selected date range from localStorage, fetch tasks for that date range
    if (selectedDateRange.value && selectedDateRange.value[0] && selectedDateRange.value[1]) {
      fetchTasksByDateRange(selectedDateRange.value, activeView.value);
    }
    // If we have a selected date from localStorage and the active view is 'date',
    // fetch tasks for that date
    else if (selectedDate.value && activeView.value === VIEW_DATE) {
      fetchTasksByDate(selectedDate.value);
    } else {
      // Otherwise fetch tasks for the active view
      fetchTasks(activeView.value);
    }
  });

  // Re-fetch tasks when user changes
  watch(() => currentUser.value, (newUser) => {
    if (newUser) {
      fetchTasks(activeView.value);
    } else {
      tasks.value = [];
    }
  });

  return {
    tasks,
    loading,
    error,
    activeView,
    selectedDate,
    selectedDateRange,
    fetchTasks,
    fetchTodayTasks,
    fetchUpcomingTasks,
    fetchPreviousTasks,
    fetchTasksByDate,
    fetchTasksByDateRange
  };
}
