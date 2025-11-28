<template>
  <div class="top-navbar">
    <h4>{{ pageTitle }}</h4>

    <div class="admin-section" @click="goToProfile">
      <span class="admin-name clickable">Admin 1</span>
      <div class="admin-avatar">
        </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router' 
import { computed } from 'vue'

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