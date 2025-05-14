import { ref, onMounted, watch } from 'vue';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import { currentUser } from '../store/auth';

export function useTasks() {
  const tasks = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const activeView = ref('today'); // Track the active view: 'today', 'upcoming', or 'previous'
  const selectedDate = ref(null); // Track the selected date for date filter

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
    activeView.value = 'today';

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
        where('recurrence', '==', 'daily')
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
    activeView.value = 'upcoming';

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
        where('recurrence', '==', 'daily')
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
    activeView.value = 'previous';

    try {
      const today = getTodayDate();

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

      // Query for daily recurring tasks
      const recurringQuery = query(
        tasksRef,
        where('userId', '==', currentUser.value.uid),
        where('recurrence', '==', 'daily')
      );

      const recurringSnapshot = await getDocs(recurringQuery);

      // Add recurring tasks, avoiding duplicates
      recurringSnapshot.forEach((doc) => {
        const taskData = {
          id: doc.id,
          ...doc.data()
        };

        // Check if this task is already in the list (from the first query)
        const exists = previousTasks.some(task => task.id === taskData.id);
        if (!exists) {
          previousTasks.push(taskData);
        }
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
    activeView.value = 'date';
    selectedDate.value = date;

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
        where('recurrence', '==', 'daily')
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

  // Function to fetch tasks based on the active view
  const fetchTasks = async (view = 'today') => {
    // If a date is selected, clear it when switching views
    if (view !== 'date') {
      selectedDate.value = null;
    }

    switch (view) {
      case 'today':
        await fetchTodayTasks();
        break;
      case 'upcoming':
        await fetchUpcomingTasks();
        break;
      case 'previous':
        await fetchPreviousTasks();
        break;
      case 'date':
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
  onMounted(() => fetchTasks(activeView.value));

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
    fetchTasks,
    fetchTodayTasks,
    fetchUpcomingTasks,
    fetchPreviousTasks,
    fetchTasksByDate
  };
}
