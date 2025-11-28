<template>
  <div class="top-navbar">
    <h4>{{ pageTitle }}</h4>

    <div class="admin-section">
      <span class="admin-name">Admin 1</span>
      <div class="admin-avatar"></div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// Mapping otomatis path → title
const titles = {
  '/dashboard': 'Dashboard',
  '/peminjaman': 'List Peminjaman',
  '/barang': 'Daftar Barang',
  '/barang/create': 'CRUD Barang',
  '/peminjaman/history': 'Riwayat Peminjaman',
  '/kelas': 'List Guru'
}

const pageTitle = titles[route.path] || 'Dashboard'
</script>

<style scoped>
@import '~/assets/css/app.css';
</style>