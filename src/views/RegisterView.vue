<template>
  <div class="register">
    <div class="app-title">
      <h1>Smart Todo App</h1>
    </div>
    <div class="form-container">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" v-model="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required />
        </div>
        <n-button type="primary" @click="register">Register</n-button>
      </form>
      <p>
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, useMessage } from 'naive-ui';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();
const message = useMessage();

const register = async () => {
  try {
    // Check if passwords match
    if (password.value !== confirmPassword.value) {
      message.error('Passwords do not match');
      return;
    }

    // Use Firebase Auth to create a new user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email.value, 
      password.value
    );

    // Update the user profile with the name
    await updateProfile(userCredential.user, {
      displayName: name.value
    });

    // If successful, redirect to login page
    message.success('Registration successful! Please log in.');
    router.push('/login');
  } catch (error) {
    // Handle registration errors
    console.error('Registration error:', error.message);
    message.error('Registration failed: ' + error.message);
  }
};
</script>

<style scoped>
.register {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 0;
  color: #333; /* Ensure text is visible */
}

.app-title {
  text-align: center;
  margin-bottom: 20px;
}

.app-title h1 {
  color: #4CAF50;
  font-size: 2rem;
  margin: 0;
}

.form-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 90%;
  max-width: 600px;
  min-width: 300px;
}

.form-container h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}

p {
  margin-top: 20px;
  text-align: center;
}

a {
  color: #4CAF50;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
