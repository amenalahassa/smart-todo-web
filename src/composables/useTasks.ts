import { ref, onMounted, watch } from 'vue';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import { currentUser } from '../store/auth';

export function useTasks() {
  const tasks = ref([]);
  const loading = ref(false);
  const error = ref(null);

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

  // Fetch tasks when component mounts
  onMounted(fetchTodayTasks);
  
  // Re-fetch tasks when user changes
  watch(() => currentUser.value, (newUser) => {
    if (newUser) {
      fetchTodayTasks();
    } else {
      tasks.value = [];
    }
  });

  return {
    tasks,
    loading,
    error,
    fetchTodayTasks
  };
}