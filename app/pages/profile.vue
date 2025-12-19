<template>
  <div class="profile-page-container">
    <h2 class="page-title">Admin 1</h2>

    <div class="profile-content">
      <div class="profile-avatar-wrapper">
        <img :src="admin.avatarUrl" alt="Admin Avatar" class="profile-avatar">
      </div>

      <div class="profile-details">
        <h3 class="user-name">{{ admin.name }}</h3>
        <p class="user-email">{{ admin.email }}</p>
      </div>
    </div>

    <div class="action-buttons">
      <button class="edit-button" @click="handleEdit">
        Edit Profile
      </button>

      <button class="logout-button" @click="handleLogout">
        Logout
      </button>
    </div>
    
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router'; 

// 1. Definisikan Metadata Halaman
definePageMeta({
  layout: 'default',
  title: 'Profile Admin'
})

// 2. Data Admin 
const admin = reactive({
    name: 'Riki Meida',
    email: 'rikimeida@gmail.com',
    avatarUrl: '/admin.png'
});

// 3. Setup Router
const router = useRouter();

const handleEdit = () => {
  console.log('Navigating to edit page');
  router.push('/edit'); 
};

// 4. Fungsi Logout
const handleLogout = () => {
    console.log('User logged out');
    router.push('/auth/login'); 
};
</script>

<style scoped>
@import "~/assets/css/profile.css";

</style>