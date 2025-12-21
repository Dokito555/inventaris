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
import { reactive, onMounted } from 'vue'
import { useRouter } from '#imports'

definePageMeta({
  layout: 'default',
  title: 'Profile Admin'
})

const admin = reactive({
  name: '',
  email: '',
  avatarUrl: '/admin.png'
})

const router = useRouter()

const handleEdit = () => {
  router.push('/edit')
}

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'DELETE', credentials: 'include' })
  } catch (e) {
    console.error('Logout failed', e)
  }
  router.push('/auth/login')
}

onMounted(async () => {
  try {
    const res = await $fetch('/api/auth/me', { credentials: 'include' })
    const data = res?.data ?? res
    if (!data) {
      router.push('/auth/login')
      return
    }

    admin.name = data.name ?? data.email ?? ''
    admin.email = data.email ?? ''
    if (data.avatarUrl) admin.avatarUrl = data.avatarUrl
  } catch (e) {
    console.error('Failed to fetch profile', e)
    router.push('/auth/login')
  }
})
</script>

<style scoped>
@import "~/assets/css/profile.css";

</style>