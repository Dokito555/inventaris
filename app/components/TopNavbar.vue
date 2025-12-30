<template>
  <div class="top-navbar">
    <h4>{{ pageTitle }}</h4>

    <div class="admin-section" @click="goToProfile">
      <span class="admin-name clickable">{{ admin.name }}</span>
      <div class="admin-avatar">
        
        <img :src="imageSrc" :key="admin.image" alt="Admin" class="nav-avatar-img">

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { reactive, computed, onMounted } from 'vue'

const route = useRoute()
const router = useRouter() 

const pageTitle = computed(() => {
  const currentPath = route.path;
  const titles = {
    '/dashboard': 'Dashboard',
    '/peminjaman': 'List Peminjaman',
    '/barang': 'Daftar Barang',
    '/barang/create': 'CRUD Barang',
    '/peminjaman/history': 'Riwayat Peminjaman',
    '/list-guru': 'List Guru', 
  }
  return route.meta.title || titles[currentPath] || 'Dashboard'
})

const goToProfile = () => {
  router.push('/profile')
}

const admin = reactive({
  name: '',
  email: '',
  image: ''
})

const imageSrc = computed(() => {
  if (!admin.image) return '/admin.png'
  
  // Jika sudah ada format data:image di database, langsung return
  if (admin.image.startsWith('data:image')) {
    return admin.image
  }
  
  // Jika hanya string mentah, asumsikan itu base64 PNG/JPG
  return `data:image/png;base64,${admin.image}`
})

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
@import '~/assets/css/app.css';


.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable:hover {
  opacity: 0.8;
}

.admin-section {
  cursor: pointer;
}
</style>