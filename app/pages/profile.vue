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

    <button class="logout-button" @click="handleLogout">
        Logout
    </button>
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
    avatarUrl: '/images/admin.png'
});

// 3. Fungsi Logout
const router = useRouter();

const handleLogout = () => {
  
    console.log('User logged out');
    router.push('/auth/login'); 
};
</script>

<style>
@import "~/assets/css/profile.css";
</style>