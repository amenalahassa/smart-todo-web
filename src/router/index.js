import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import { currentUser, isAuthReady } from '../store/auth';

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
  const isAuthRoute = to.path === '/login' || to.path === '/register';

  // If auth is not ready yet, wait before deciding
  if (!isAuthReady.value) {
    // This should not happen since we initialize auth before mounting the app
    // If the route requires auth, redirect to login as a precaution
    if (requiresAuth) {
      next('/login');
    } else {
      next();
    }
    return;
  }

  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (currentUser.value && isAuthRoute) {
    next('/dashboard');
  } else if (requiresAuth && !currentUser.value) {
    // Redirect to login if not authenticated and trying to access protected route
    next('/login');
  } else {
    // Continue to the route
    next();
  }
});

export default router;
