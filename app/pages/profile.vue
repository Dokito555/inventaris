<template>
  <div class="profile-page-container">
    <h2 class="page-title">Admin 1</h2>

    <div class="profile-content">
      <div class="profile-avatar-wrapper">
        <img :src="imageSrc" :key="admin.image" alt="Admin Avatar" class="profile-avatar">
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
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from '#imports'

definePageMeta({
  layout: 'default',
  title: 'Profile Admin'
})

const admin = reactive({
  name: '',
  email: '',
  image: ''
})

const router = useRouter()

const imageSrc = computed(() => {
  if (!admin.image) return '/admin.png'
  
  // Jika sudah ada format data:image di database, langsung return
  if (admin.image.startsWith('data:image')) {
    return admin.image
  }
  
  // Jika hanya string mentah, asumsikan itu base64 PNG/JPG
  return `data:image/png;base64,${admin.image}`
})

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
    const userData = res.data || res

    if (!userData) {
      router.push('/auth/login')
      return
    }

    admin.name = userData.name || 'Admin'
    admin.email = userData.email || ''
    
    // Hapus spasi atau baris baru jika ada (sering terjadi pada penyimpanan Base64)
    if (userData.image) {
      admin.image = userData.image.trim()
    } else {
      admin.image = ''
    }
    
  } catch (e) {
    console.error('Failed to fetch profile', e)
    router.push('/auth/login')
  }
})
</script>

<style scoped>
@import "~/assets/css/profile.css";

</style>