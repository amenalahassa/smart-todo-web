import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import { auth } from '../firebase';

// Route configuration
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route guard for Firebase authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const currentUser = auth.currentUser;

  if (requiresAuth && !currentUser) {
    // Redirect to login if not authenticated
    next('/login');
  } else {
    // Continue to the route
    next();
  }
});

export default router;
