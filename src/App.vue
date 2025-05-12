<script setup>
// App.vue is now a shell that uses router-view to display the current route component
</script>

<template>
  <div class="app">
    <header>
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="50" height="50" />
      <h1 class="app-title">Smart Todo App</h1>
    </header>

    <main>
      <!-- Router view will render the component matching the current route -->
      <router-view />
    </main>

    <footer>
      <p>&copy; 2025 Smart Todo App</p>
    </footer>
  </div>
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
  padding: 1rem;
}

footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style>
