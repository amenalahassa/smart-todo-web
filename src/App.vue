<script setup>
// App.vue is now a shell that uses router-view to display the current route component
import { NConfigProvider, NMessageProvider } from 'naive-ui'
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <div class="app">
        <header class="app-header">
          <p class="copyright">&copy; 2025 Smart Todo App</p>
        </header>
        <main>
          <!-- Router view will render the component matching the current route -->
          <router-view />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #4CAF50;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
}

.logo {
  margin-right: 1rem;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
}

main {
  flex: 1;
  padding: 0;
}

.app-header {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 0.5rem;
  border-bottom: 1px solid #444;
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}
</style>
